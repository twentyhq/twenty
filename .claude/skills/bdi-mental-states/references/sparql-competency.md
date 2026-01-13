# SPARQL Competency Queries

Validation queries for BDI ontology implementations based on competency questions.

## Mental Entity Queries

### CQ1: What are all mental entities?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?entity ?type WHERE {
    ?entity rdf:type ?type .
    ?type rdfs:subClassOf* bdi:MentalEntity .
}
```

### CQ2: What beliefs does an agent hold?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?label WHERE {
    ?agent bdi:hasMentalState ?belief .
    ?belief a bdi:Belief .
    OPTIONAL { ?belief rdfs:label ?label }
}
```

### CQ3: What desires does an agent have?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?desire ?label WHERE {
    ?agent bdi:hasDesire ?desire .
    ?desire a bdi:Desire .
    OPTIONAL { ?desire rdfs:label ?label }
}
```

### CQ4: What intentions has an agent committed to?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?label WHERE {
    ?agent bdi:hasIntention ?intention .
    ?intention a bdi:Intention .
    OPTIONAL { ?intention rdfs:label ?label }
}
```

## Motivational Chain Queries

### CQ5: What beliefs motivated formation of a given desire?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?beliefLabel WHERE {
    ?desire bdi:isMotivatedBy ?belief .
    ?belief a bdi:Belief .
    OPTIONAL { ?belief rdfs:label ?beliefLabel }
}
```

### CQ6: Which desire does a particular intention fulfill?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?desire ?desireLabel WHERE {
    ?intention bdi:fulfils ?desire .
    ?desire a bdi:Desire .
    OPTIONAL { ?desire rdfs:label ?desireLabel }
}
```

### CQ7: What beliefs support a given intention?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?label WHERE {
    ?intention bdi:isSupportedBy ?belief .
    ?belief a bdi:Belief .
    OPTIONAL { ?belief rdfs:label ?label }
}
```

### CQ8: Trace complete cognitive chain for an intention

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?desire ?belief ?worldState WHERE {
    ?intention a bdi:Intention ;
               bdi:fulfils ?desire ;
               bdi:isSupportedBy ?belief .
    ?desire bdi:isMotivatedBy ?belief .
    ?belief bdi:refersTo ?worldState .
}
```

## Mental Process Queries

### CQ9: Which mental process generated a belief?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process ?processType WHERE {
    ?process bdi:generates ?belief .
    ?belief a bdi:Belief .
    ?process a ?processType .
    FILTER(?processType != owl:NamedIndividual)
}
```

### CQ10: What triggered a mental process?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process ?trigger ?triggerType WHERE {
    ?process a bdi:MentalProcess ;
             bdi:isTriggeredBy ?trigger .
    ?trigger a ?triggerType .
}
```

### CQ11: What did a mental process reason upon?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process ?input WHERE {
    ?process a bdi:MentalProcess ;
             bdi:reasonsUpon ?input .
}
```

## Plan and Goal Queries

### CQ12: What plan does an intention specify?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?plan ?goal WHERE {
    ?intention bdi:specifies ?plan .
    ?plan a bdi:Plan ;
          bdi:addresses ?goal .
}
```

### CQ13: What is the ordered sequence of tasks in a plan?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?plan ?task ?nextTask WHERE {
    ?plan a bdi:Plan ;
          bdi:hasComponent ?task .
    OPTIONAL { ?task bdi:precedes ?nextTask }
}
ORDER BY ?task
```

### CQ14: What is the first and last task of a plan?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?plan ?firstTask ?lastTask WHERE {
    ?plan a bdi:Plan ;
          bdi:beginsWith ?firstTask ;
          bdi:endsWith ?lastTask .
}
```

### CQ15: Which actions executed which tasks?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?action ?task ?time WHERE {
    ?action bdi:isExecutionOf ?task ;
            bdi:atTime ?time .
}
ORDER BY ?time
```

## Temporal Queries

### CQ16: What mental states are valid at a specific time?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?mentalState ?type WHERE {
    ?mentalState bdi:hasValidity ?interval .
    ?interval bdi:hasStartTime ?start ;
              bdi:hasEndTime ?end .
    ?mentalState a ?type .
    FILTER(?start <= "2026-01-04T10:00:00"^^xsd:dateTime && 
           ?end >= "2026-01-04T10:00:00"^^xsd:dateTime)
}
```

### CQ17: When was a belief formed?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?formationTime WHERE {
    ?process bdi:generates ?belief ;
             bdi:atTime ?formationTime .
    ?belief a bdi:Belief .
}
```

### CQ18: What is the temporal validity of an intention?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?start ?end WHERE {
    ?intention a bdi:Intention ;
               bdi:hasValidity ?interval .
    ?interval bdi:hasStartTime ?start ;
              bdi:hasEndTime ?end .
}
```

## Justification Queries

### CQ19: What justifies a belief?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?justification ?justLabel WHERE {
    ?belief a bdi:Belief ;
            bdi:isJustifiedBy ?justification .
    OPTIONAL { ?justification rdfs:label ?justLabel }
}
```

### CQ20: What justifies an intention?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention ?justification ?justLabel WHERE {
    ?intention a bdi:Intention ;
               bdi:isJustifiedBy ?justification .
    OPTIONAL { ?justification rdfs:label ?justLabel }
}
```

## Compositional Queries

### CQ21: What parts comprise a complex belief?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?part ?partLabel WHERE {
    ?belief a bdi:Belief ;
            bdi:hasPart ?part .
    OPTIONAL { ?part rdfs:label ?partLabel }
}
```

### CQ22: Find composite mental entities

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?composite (COUNT(?part) AS ?partCount) WHERE {
    ?composite bdi:hasPart ?part .
}
GROUP BY ?composite
HAVING (COUNT(?part) > 1)
```

## World State Queries

### CQ23: What world state does a belief refer to?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief ?worldState ?wsComment WHERE {
    ?belief a bdi:Belief ;
            bdi:refersTo ?worldState .
    OPTIONAL { ?worldState rdfs:comment ?wsComment }
}
```

### CQ24: What actions brought about a world state?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?action ?worldState WHERE {
    ?action bdi:bringsAbout ?worldState .
    ?worldState a bdi:WorldState .
}
```

### CQ25: What world states has an agent perceived?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?agent ?worldState ?time WHERE {
    ?agent bdi:perceives ?worldState .
    OPTIONAL { ?worldState bdi:atTime ?time }
}
```

## Validation Queries (OWLUnit Style)

### V1: Every intention must fulfill exactly one desire

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?intention WHERE {
    ?intention a bdi:Intention .
    FILTER NOT EXISTS { ?intention bdi:fulfils ?desire }
}
# Expected: Empty result set
```

### V2: Every belief must reference a world state

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief WHERE {
    ?belief a bdi:Belief .
    FILTER NOT EXISTS { ?belief bdi:refersTo ?worldState }
}
# Expected: Empty result set (or only abstract beliefs)
```

### V3: Mental processes must reason upon something

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process WHERE {
    ?process a bdi:MentalProcess .
    FILTER NOT EXISTS { ?process bdi:reasonsUpon ?input }
}
# Expected: Empty result set
```

### V4: BeliefProcess must generate only Beliefs

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?process ?generated WHERE {
    ?process a bdi:BeliefProcess ;
             bdi:generates ?generated .
    FILTER NOT EXISTS { ?generated a bdi:Belief }
}
# Expected: Empty result set
```

### V5: Plans must have begin and end tasks

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?plan WHERE {
    ?plan a bdi:Plan .
    FILTER NOT EXISTS { 
        ?plan bdi:beginsWith ?first ;
              bdi:endsWith ?last 
    }
}
# Expected: Empty result set
```

## Multi-Agent Queries

### CQ26: What beliefs are shared across agents?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?belief (COUNT(DISTINCT ?agent) AS ?agentCount) WHERE {
    ?agent bdi:hasMentalState ?belief .
    ?belief a bdi:Belief .
}
GROUP BY ?belief
HAVING (COUNT(DISTINCT ?agent) > 1)
```

### CQ27: Which agents share the same desire?

```sparql
PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>

SELECT ?desire ?agent1 ?agent2 WHERE {
    ?agent1 bdi:hasDesire ?desire .
    ?agent2 bdi:hasDesire ?desire .
    FILTER(?agent1 != ?agent2)
}
```

