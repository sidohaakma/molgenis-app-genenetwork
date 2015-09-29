var exp = module.exports
var fs = require('fs')

var genes = readGenes()
var genesByENSG = {}
var genesByName = {}
for (var i = 0; i < genes.length; i++) {
    genesByENSG[genes[i].id] = genes[i]
    genesByName[genes[i].name] = genes[i]
}

var genesIDNameHref = {}
genesIDNameHref.comment = sails.config.version.comment()
genesIDNameHref.version = sails.config.version.version
genesIDNameHref.href = sails.config.version.apiUrl + '/gene'
genesIDNameHref.genes = []
for (var i = 0; i < genes.length; i++) {
    genesIDNameHref.genes.push({
        id: genes[i].id,
        name: genes[i].name,
        href: sails.config.version.apiUrl + '/gene/' + genes[i].id
    })
}
var genesJSONStr = JSON.stringify(genesIDNameHref, null, 2)

exp.getAll = function() {
    return genes
}

exp.getAllJSONStr = function() {
    return genesJSONStr
}

exp.getNumGenes = function() {
    return genes.length
}

exp.getByENSG = function(ensg) {
    return genesByENSG[ensg]
}

exp.get = function(x) {
    var gene = null
    if (typeof x === 'number') {
        gene = genes[x]
    } else {
        x = x.trim().toUpperCase()
        // var colonI = x.indexOf(':')
        // if (colonI > 0) {
        //     x = x.substring(0, colonI)
        // }
        if (x.substring(0, 4) === 'ENSG') {
            gene = genesByENSG[x]
        } else {
            gene = genesByName[x]
        }
    }
    return gene
}

exp.getMap = function(names) {
    var map = {}
    for (var i = 0; i < names.length; i++) {
        var gene = this.get(names[i])
//        if (names[i].indexOf(':') > -1) {
//            gene = this.get(names[i].substring(0, names[i].indexOf(':')))
//        }
        if (gene) {
            map[names[i]] = gene
        }
    }
    return map
}

exp.getArray = function(names) {
    var arr = []
    var ensgs = []
    for (var i = 0; i < names.length; i++) {
        var gene = this.get(names[i])
        if (!gene && names[i].indexOf(':') > -1) {
            gene = this.get(names[i].substring(0, names[i].indexOf(':')))
        }
        if (gene && ensgs.indexOf(gene.id) < 0) {
            arr.push(gene)
            ensgs.push(gene.id)
        }
    }
    return arr
}

function readGenes() {
    var lines = fs.readFileSync(sails.config.geneDescFile, 'utf8').split('\n')
    var geneObjects = []
    for (var i = 1; i < lines.length; i++) {
        var split = lines[i].split('\t')
        if (split.length > 8) {
            geneObjects.push({
                id: split[0],
                // so if you use 'index', it will be overwritten by something at some point:
                // in the browser, the indices are overwritten according to the indices in the array...
                // jesus christ
                index_: (i - 1),
                name: split[1],
                biotype: split[3],
                chr: split[4],
                start: Number(split[5]),
                stop: Number(split[6]),
                strand: Number(split[7]),
                description: split[8],
                biomartRelease: sails.config.version.biomartRelease,
                assemblyRelease: sails.config.version.assemblyRelease
            })
        }
    }
    sails.log.info(geneObjects.length + ' genes read from ' + sails.config.geneDescFile)
    return geneObjects
}
