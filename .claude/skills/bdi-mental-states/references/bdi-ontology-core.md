# BDI Ontology Core Patterns

Core ontology design patterns for Belief-Desire-Intention mental state modeling.

## Class Hierarchy

### Mental Entities (Endurants)

```
bdi:MentalEntity
├── bdi:Belief          # Informational dimension
├── bdi:Desire          # Motivational dimension  
├── bdi:Intention       # Deliberative dimension
├── bdi:Goal            # Description of desired end state
└── bdi:Plan            # Structured action sequence
```

### Mental Processes (Perdurants)

```
bdi:MentalProcess
├── bdi:BeliefProcess      # Forms/updates beliefs from perception
├── bdi:DesireProcess      # Generates desires from beliefs
├── bdi:IntentionProcess   # Commits to desires as intentions
├── bdi:Planning           # Transforms intentions into plans
└── bdi:PlanExecution      # Executes plan actions
```

### Supporting Entities

```
bdi:WorldState        # Configuration of environment
bdi:Justification     # Evidential basis for mental states
bdi:Task              # Atomic unit of planned action
bdi:Action            # Execution of a task
bdi:TimeInterval      # Temporal validity bounds
bdi:TimeInstant       # Point in time reference
```

## Object Properties

### Motivational Relations

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `motivates` | Belief | Desire | Belief provides reason for desire |
| `isMotivatedBy` | Desire | Belief | Inverse of motivates |
| `fulfils` | Intention | Desire | Intention commits to achieving desire |
| `isFulfilledBy` | Desire | Intention | Inverse of fulfils |
| `isSupportedBy` | Intention | Belief | Beliefs supporting intention viability |

### Generative Relations

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `generates` | MentalProcess | MentalEntity | Process creates mental state |
| `isGeneratedBy` | MentalEntity | MentalProcess | Inverse of generates |
| `modifies` | MentalProcess | MentalEntity | Process updates existing state |
| `suppresses` | MentalProcess | MentalEntity | Process deactivates state |
| `isTriggeredBy` | MentalProcess | MentalEntity | State initiates process |

### Referential Relations

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `refersTo` | MentalEntity | WorldState | Mental state about world |
| `perceives` | Agent | WorldState | Agent observes world |
| `bringsAbout` | Action | WorldState | Action causes world change |
| `reasonsUpon` | MentalProcess | MentalEntity | Input to reasoning |

### Structural Relations

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `hasPart` | MentalEntity | MentalEntity | Meronymic composition |
| `specifies` | Intention | Plan | Intention defines plan |
| `addresses` | Plan | Goal | Plan achieves goal |
| `hasComponent` | Plan | Task | Plan contains tasks |
| `precedes` | Task | Task | Task ordering |

### Temporal Relations

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `atTime` | Entity | TimeInstant | Point occurrence |
| `hasValidity` | MentalEntity | TimeInterval | Persistence bounds |
| `hasStartTime` | TimeInterval | TimeInstant | Interval start |
| `hasEndTime` | TimeInterval | TimeInstant | Interval end |

### Justification Relations

| Property | Domain | Range | Description |
|----------|--------|-------|-------------|
| `isJustifiedBy` | MentalEntity | Justification | Evidential support |
| `justifies` | Justification | MentalEntity | Inverse relation |

## Ontological Restrictions

### Belief Restrictions

```turtle
bdi:Belief rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:refersTo ;
    owl:someValuesFrom bdi:WorldState
] .

bdi:Belief rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:hasValidity ;
    owl:maxCardinality 1
] .
```

### Desire Restrictions

```turtle
bdi:Desire rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:isMotivatedBy ;
    owl:someValuesFrom bdi:Belief
] .
```

### Intention Restrictions

```turtle
bdi:Intention rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:fulfils ;
    owl:cardinality 1
] .

bdi:Intention rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:isSupportedBy ;
    owl:someValuesFrom bdi:Belief
] .
```

### Mental Process Restrictions

```turtle
bdi:BeliefProcess rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:generates ;
    owl:allValuesFrom bdi:Belief
] .

bdi:DesireProcess rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:generates ;
    owl:allValuesFrom bdi:Desire
] .

bdi:IntentionProcess rdfs:subClassOf [
    a owl:Restriction ;
    owl:onProperty bdi:generates ;
    owl:allValuesFrom bdi:Intention
] .
```

## DOLCE Alignment

The BDI ontology aligns with DOLCE Ultra Lite (DUL) foundational ontology:

| BDI Class | DUL Superclass | Rationale |
|-----------|----------------|-----------|
| `Agent` | `dul:Agent` | Intentional entity capable of action |
| `Belief` | `dul:InformationObject` | Information-bearing entity |
| `Desire` | `dul:Description` | Describes desired state |
| `Intention` | `dul:Description` | Describes committed course |
| `Goal` | `dul:Goal` | Desired end state description |
| `Plan` | `dul:Plan` | Organized action sequence |
| `WorldState` | `dul:Situation` | Configuration of entities |
| `MentalProcess` | `dul:Event` | Temporally extended occurrence |
| `Task` | `dul:Task` | Unit of planned work |
| `Action` | `dul:Action` | Performed task instance |

## Reused Ontology Design Patterns

### EventCore Pattern
Used for mental processes with temporal aspects and participant roles.

### Situation Pattern  
Used for world state configurations that mental states reference.

### TimeIndexedSituation Pattern
Used for associating mental states with validity intervals.

### BasicPlan Pattern
Used for goal-plan-task structures linking intentions to actions.

### Provenance Pattern
Used for justification tracking and evidential chains.

## Namespace Declarations

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix dul: <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
```

