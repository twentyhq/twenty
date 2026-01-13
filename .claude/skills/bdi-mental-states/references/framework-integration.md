# BDI Framework Integration Patterns

Integration patterns for connecting BDI ontology with executable agent frameworks.

## SEMAS Rule Translation

Map BDI ontology constructs to SEMAS production rules.

### Ontology-to-Rule Mapping

| BDI Construct | SEMAS Element | Example |
|---------------|---------------|---------|
| Belief | HEAD fact | `belief(agent_a, store_open)` |
| Supporting beliefs | CONDITIONALS | `[CONDITIONALS: time(weekday)]` |
| Desire generation | TAIL action | `generate_desire(agent, goal)` |
| Intention commitment | TAIL action | `commit_intention(agent, goal)` |
| Plan specification | TAIL action | `create_plan(agent, plan_id)` |

### Rule Templates

**Belief triggers desire formation:**
```prolog
[HEAD: belief(Agent, Fact)] / 
[CONDITIONALS: context_condition(Agent, Context)] » 
[TAIL: generate_desire(Agent, DesiredState)].
```

**Desire triggers intention commitment:**
```prolog
[HEAD: desire(Agent, Goal)] / 
[CONDITIONALS: belief(Agent, SupportingFact1), 
               belief(Agent, SupportingFact2)] » 
[TAIL: commit_intention(Agent, Goal)].
```

**Intention triggers planning:**
```prolog
[HEAD: intention(Agent, Goal)] / 
[CONDITIONALS: goal(GoalSpec)] » 
[TAIL: create_plan(Agent, PlanId)].
```

**Plan triggers execution:**
```prolog
[HEAD: plan(Agent, PlanId)] / 
[CONDITIONALS: ready_to_execute(Agent)] » 
[TAIL: execute_plan(Agent, PlanId)].
```

### Complete SEMAS Example

```prolog
% ============================================================
% GROCERY SHOPPING SCENARIO
% ============================================================

% Phase 1: Belief formation from world state
[HEAD: perceive(agent_a, store_open)] / 
[CONDITIONALS: time(weekday_afternoon)] » 
[TAIL: add_belief(agent_a, store_open)].

% Phase 2: Desire generation from belief
[HEAD: belief(agent_a, store_open)] / 
[CONDITIONALS: belief(agent_a, needs_groceries)] » 
[TAIL: generate_desire(agent_a, buy_groceries)].

% Phase 3: Intention commitment from desire
[HEAD: desire(agent_a, buy_groceries)] / 
[CONDITIONALS: belief(agent_a, has_shopping_list), 
               belief(agent_a, store_open),
               belief(agent_a, has_transportation)] » 
[TAIL: commit_intention(agent_a, buy_groceries)].

% Phase 4: Plan creation from intention
[HEAD: intention(agent_a, buy_groceries)] / 
[CONDITIONALS: goal(complete_shopping)] » 
[TAIL: create_plan(agent_a, shopping_plan)].

% Phase 5: Plan execution
[HEAD: plan(agent_a, shopping_plan)] / 
[CONDITIONALS: preconditions_met(shopping_plan)] » 
[TAIL: execute_task(agent_a, drive_to_store),
       execute_task(agent_a, select_items),
       execute_task(agent_a, checkout),
       execute_task(agent_a, return_home)].

% Phase 6: World state update
[HEAD: task_complete(agent_a, checkout)] / 
[CONDITIONALS: items_purchased(agent_a)] » 
[TAIL: update_world_state(has_groceries),
       remove_desire(agent_a, buy_groceries),
       remove_intention(agent_a, buy_groceries)].
```

### Python Translation Layer

```python
from rdflib import Graph, Namespace, RDF

BDI = Namespace("https://w3id.org/fossr/ontology/bdi/")

def ontology_to_semas_rules(bdi_graph: Graph) -> list[str]:
    """
    Translate BDI ontology instances to SEMAS production rules.
    """
    rules = []
    
    # Extract belief-desire-intention chains
    for intention in bdi_graph.subjects(RDF.type, BDI.Intention):
        # Get supporting beliefs
        supporting_beliefs = list(bdi_graph.objects(intention, BDI.isSupportedBy))
        
        # Get fulfilled desire
        fulfilled_desires = list(bdi_graph.objects(intention, BDI.fulfils))
        
        # Get specified plan
        specified_plans = list(bdi_graph.objects(intention, BDI.specifies))
        
        if fulfilled_desires and supporting_beliefs:
            desire = fulfilled_desires[0]
            beliefs_str = ", ".join([format_belief(b, bdi_graph) for b in supporting_beliefs])
            
            rule = (
                f"[HEAD: {format_desire(desire, bdi_graph)}] / "
                f"[CONDITIONALS: {beliefs_str}] » "
                f"[TAIL: commit_intention({format_intention(intention, bdi_graph)})]"
            )
            rules.append(rule)
        
        if specified_plans:
            plan = specified_plans[0]
            rule = (
                f"[HEAD: {format_intention(intention, bdi_graph)}] / "
                f"[CONDITIONALS: ready_to_plan] » "
                f"[TAIL: create_plan({format_plan(plan, bdi_graph)})]"
            )
            rules.append(rule)
    
    return rules

def format_belief(belief_uri, graph):
    label = graph.value(belief_uri, RDFS.label)
    return f"belief({label or belief_uri.split('/')[-1]})"

def format_desire(desire_uri, graph):
    label = graph.value(desire_uri, RDFS.label)
    return f"desire({label or desire_uri.split('/')[-1]})"

def format_intention(intention_uri, graph):
    label = graph.value(intention_uri, RDFS.label)
    return f"intention({label or intention_uri.split('/')[-1]})"

def format_plan(plan_uri, graph):
    label = graph.value(plan_uri, RDFS.label)
    return f"plan({label or plan_uri.split('/')[-1]})"
```

## Logic Augmented Generation (LAG)

Augment LLM outputs with BDI ontological constraints.

### LAG Pipeline Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Query    │────▶│  Ontology       │────▶│  Augmented      │
│                 │     │  Injection      │     │  Prompt         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Validated      │◀────│  Ontology       │◀────│  LLM Response   │
│  RDF Triples    │     │  Validation     │     │  (Triples)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### LAG Implementation

```python
from rdflib import Graph, Namespace
from rdflib.plugins.parsers.notation3 import BadSyntax

BDI = Namespace("https://w3id.org/fossr/ontology/bdi/")

class BDILogicAugmentedGenerator:
    def __init__(self, ontology_path: str, llm_client):
        self.ontology = Graph()
        self.ontology.parse(ontology_path, format='turtle')
        self.llm = llm_client
    
    def generate_mental_states(self, context: str) -> Graph:
        """
        Generate BDI mental states from context using LAG.
        """
        # Phase 1: Inject ontology into prompt
        ontology_turtle = self.ontology.serialize(format='turtle')
        augmented_prompt = self._build_augmented_prompt(context, ontology_turtle)
        
        # Phase 2: Generate with LLM
        response = self.llm.generate(augmented_prompt)
        
        # Phase 3: Extract and validate triples
        triples = self._extract_triples(response)
        validated = self._validate_against_ontology(triples)
        
        if not validated['is_consistent']:
            # Retry with feedback
            return self._retry_with_feedback(context, validated['errors'])
        
        return validated['graph']
    
    def _build_augmented_prompt(self, context: str, ontology: str) -> str:
        return f"""
You are a BDI mental state modeler. Given the following context, generate 
RDF triples representing the agent's beliefs, desires, and intentions.

## BDI Ontology (use these classes and properties):
{ontology}

## Context to Model:
{context}

## Instructions:
1. Identify world states from the context
2. Generate beliefs that refer to those world states
3. Generate desires motivated by those beliefs
4. Generate intentions that fulfill desires and are supported by beliefs
5. Include justifications for each mental state
6. Include temporal validity intervals

Output valid Turtle RDF triples only.
"""
    
    def _extract_triples(self, response: str) -> str:
        """Extract Turtle content from LLM response."""
        # Find turtle block in response
        if "```turtle" in response:
            start = response.find("```turtle") + 9
            end = response.find("```", start)
            return response[start:end].strip()
        return response
    
    def _validate_against_ontology(self, triples: str) -> dict:
        """Validate generated triples against BDI ontology."""
        result = {'is_consistent': True, 'errors': [], 'graph': None}
        
        try:
            generated = Graph()
            generated.parse(data=triples, format='turtle')
            result['graph'] = generated
            
            # Validate constraints
            errors = []
            
            # Check: Every intention must fulfill a desire
            for intention in generated.subjects(RDF.type, BDI.Intention):
                if not list(generated.objects(intention, BDI.fulfils)):
                    errors.append(f"Intention {intention} does not fulfill any desire")
            
            # Check: Every belief should reference a world state
            for belief in generated.subjects(RDF.type, BDI.Belief):
                if not list(generated.objects(belief, BDI.refersTo)):
                    errors.append(f"Belief {belief} does not reference a world state")
            
            # Check: Desires should be motivated by beliefs
            for desire in generated.subjects(RDF.type, BDI.Desire):
                if not list(generated.objects(desire, BDI.isMotivatedBy)):
                    errors.append(f"Desire {desire} has no motivating belief")
            
            if errors:
                result['is_consistent'] = False
                result['errors'] = errors
                
        except BadSyntax as e:
            result['is_consistent'] = False
            result['errors'] = [f"Invalid Turtle syntax: {e}"]
        
        return result
    
    def _retry_with_feedback(self, context: str, errors: list) -> Graph:
        """Retry generation with error feedback."""
        feedback_prompt = f"""
Previous generation had errors:
{chr(10).join(errors)}

Please regenerate the mental states fixing these issues.

Context: {context}
"""
        response = self.llm.generate(feedback_prompt)
        triples = self._extract_triples(response)
        result = self._validate_against_ontology(triples)
        
        if result['is_consistent']:
            return result['graph']
        else:
            raise ValueError(f"Failed to generate valid mental states: {result['errors']}")
```

### Inconsistency Detection Example

```python
def detect_location_inconsistency(graph: Graph) -> list[str]:
    """
    Detect inconsistencies where agent cannot be in two places.
    """
    inconsistencies = []
    
    # Query for location beliefs
    query = """
    PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
    
    SELECT ?agent ?belief1 ?belief2 ?loc1 ?loc2 WHERE {
        ?agent bdi:hasBelief ?belief1 , ?belief2 .
        ?belief1 bdi:refersTo ?ws1 .
        ?belief2 bdi:refersTo ?ws2 .
        ?ws1 bdi:hasLocation ?loc1 .
        ?ws2 bdi:hasLocation ?loc2 .
        FILTER(?belief1 != ?belief2 && ?loc1 != ?loc2)
        
        # Check temporal overlap
        ?belief1 bdi:hasValidity ?interval1 .
        ?belief2 bdi:hasValidity ?interval2 .
        ?interval1 bdi:hasStartTime ?start1 ; bdi:hasEndTime ?end1 .
        ?interval2 bdi:hasStartTime ?start2 ; bdi:hasEndTime ?end2 .
        FILTER(?start1 < ?end2 && ?start2 < ?end1)
    }
    """
    
    for row in graph.query(query):
        inconsistencies.append(
            f"Agent {row.agent} has conflicting location beliefs: "
            f"{row.loc1} and {row.loc2} at overlapping times"
        )
    
    return inconsistencies
```

## JADE/JADEX Integration

Map BDI ontology to JADE/JADEX agent platform structures.

### JADE Agent Structure

```java
public class BDIAgent extends Agent {
    // Mental state storage (maps to ontology individuals)
    private Set<Belief> beliefs = new HashSet<>();
    private Set<Desire> desires = new HashSet<>();
    private Set<Intention> intentions = new HashSet<>();
    
    // Ontology-backed mental state management
    private Graph mentalStateGraph;
    
    public void addBelief(Belief belief) {
        beliefs.add(belief);
        
        // Add to RDF graph
        Resource beliefResource = mentalStateGraph.createResource(belief.getUri());
        beliefResource.addProperty(RDF.type, BDI.Belief);
        beliefResource.addProperty(BDI.refersTo, belief.getWorldState().getUri());
        beliefResource.addProperty(BDI.hasValidity, createInterval(belief.getValidity()));
        
        // Trigger desire formation
        triggerDesireProcess(belief);
    }
    
    public void commitIntention(Intention intention) {
        intentions.add(intention);
        
        Resource intentionResource = mentalStateGraph.createResource(intention.getUri());
        intentionResource.addProperty(RDF.type, BDI.Intention);
        intentionResource.addProperty(BDI.fulfils, intention.getDesire().getUri());
        
        for (Belief support : intention.getSupportingBeliefs()) {
            intentionResource.addProperty(BDI.isSupportedBy, support.getUri());
        }
        
        // Trigger planning
        triggerPlanning(intention);
    }
    
    // Export mental states as RDF
    public String exportMentalStates() {
        return mentalStateGraph.serialize(Format.TURTLE);
    }
    
    // Import mental states from RDF
    public void importMentalStates(String turtle) {
        Graph imported = new Graph();
        imported.parse(turtle, Format.TURTLE);
        
        // Reconstruct Java objects from RDF
        for (Resource belief : imported.listSubjectsWithProperty(RDF.type, BDI.Belief)) {
            Belief b = reconstructBelief(belief);
            beliefs.add(b);
        }
        // ... similar for desires and intentions
    }
}
```

### JADEX Goal Mapping

```java
// Map BDI ontology goals to JADEX goals
@Goal
public class OntologyBackedGoal {
    @GoalParameter
    protected String goalUri;
    
    @GoalParameter
    protected Graph ontologyGraph;
    
    public OntologyBackedGoal(Resource goalResource, Graph graph) {
        this.goalUri = goalResource.getURI();
        this.ontologyGraph = graph;
    }
    
    @GoalTargetCondition
    public boolean isAchieved() {
        // Query ontology for goal achievement
        String query = """
            PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
            ASK {
                ?execution bdi:addresses <%s> ;
                           bdi:bringsAbout ?worldState .
            }
            """.formatted(goalUri);
        
        return ontologyGraph.ask(query);
    }
    
    @GoalDropCondition
    public boolean shouldDrop() {
        // Check if supporting beliefs are invalidated
        String query = """
            PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
            ASK {
                ?intention bdi:specifies ?plan .
                ?plan bdi:addresses <%s> .
                ?intention bdi:isSupportedBy ?belief .
                ?belief bdi:hasValidity ?interval .
                ?interval bdi:hasEndTime ?end .
                FILTER(?end < NOW())
            }
            """.formatted(goalUri);
        
        return ontologyGraph.ask(query);
    }
}
```

## RDF Triple Store Integration

### Triple Store Configuration

```python
from rdflib import Graph
from rdflib.plugins.stores.sparqlstore import SPARQLUpdateStore

class BDIMentalStateStore:
    def __init__(self, endpoint: str):
        self.store = SPARQLUpdateStore()
        self.store.open((endpoint + "/query", endpoint + "/update"))
        self.graph = Graph(store=self.store, identifier="http://example.org/bdi")
    
    def add_belief(self, agent_uri: str, belief_data: dict):
        """Add belief to triple store."""
        belief_uri = f"{agent_uri}/belief/{belief_data['id']}"
        
        self.graph.add((URIRef(belief_uri), RDF.type, BDI.Belief))
        self.graph.add((URIRef(belief_uri), RDFS.label, Literal(belief_data['label'])))
        self.graph.add((URIRef(belief_uri), BDI.refersTo, URIRef(belief_data['world_state'])))
        self.graph.add((URIRef(agent_uri), BDI.hasMentalState, URIRef(belief_uri)))
        
        # Add temporal validity
        interval_uri = f"{belief_uri}/validity"
        self.graph.add((URIRef(belief_uri), BDI.hasValidity, URIRef(interval_uri)))
        self.graph.add((URIRef(interval_uri), BDI.hasStartTime, 
                        Literal(belief_data['start_time'], datatype=XSD.dateTime)))
        self.graph.add((URIRef(interval_uri), BDI.hasEndTime,
                        Literal(belief_data['end_time'], datatype=XSD.dateTime)))
    
    def get_active_beliefs(self, agent_uri: str, at_time: datetime) -> list:
        """Query beliefs active at specific time."""
        query = """
        PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        
        SELECT ?belief ?label WHERE {
            <%s> bdi:hasMentalState ?belief .
            ?belief a bdi:Belief ;
                    rdfs:label ?label ;
                    bdi:hasValidity ?interval .
            ?interval bdi:hasStartTime ?start ;
                      bdi:hasEndTime ?end .
            FILTER(?start <= "%s"^^xsd:dateTime && ?end >= "%s"^^xsd:dateTime)
        }
        """ % (agent_uri, at_time.isoformat(), at_time.isoformat())
        
        return list(self.graph.query(query))
    
    def get_cognitive_chain(self, intention_uri: str) -> dict:
        """Trace complete cognitive chain for an intention."""
        query = """
        PREFIX bdi: <https://w3id.org/fossr/ontology/bdi/>
        
        SELECT ?intention ?desire ?belief ?worldState ?plan WHERE {
            <%s> a bdi:Intention ;
                 bdi:fulfils ?desire ;
                 bdi:isSupportedBy ?belief .
            OPTIONAL { <%s> bdi:specifies ?plan }
            ?desire bdi:isMotivatedBy ?belief .
            ?belief bdi:refersTo ?worldState .
        }
        """ % (intention_uri, intention_uri)
        
        results = list(self.graph.query(query))
        if results:
            row = results[0]
            return {
                'intention': str(row.intention),
                'desire': str(row.desire),
                'belief': str(row.belief),
                'world_state': str(row.worldState),
                'plan': str(row.plan) if row.plan else None
            }
        return None
```

## FIPA ACL Integration

Map BDI mental states to FIPA Agent Communication Language.

```python
from fipa_acl import ACLMessage, Performative

class BDICommunicator:
    def __init__(self, agent_id: str, mental_state_store: BDIMentalStateStore):
        self.agent_id = agent_id
        self.store = mental_state_store
    
    def share_belief(self, belief_uri: str, receiver: str) -> ACLMessage:
        """Create INFORM message to share belief."""
        belief_triples = self.store.get_belief_as_turtle(belief_uri)
        
        message = ACLMessage()
        message.performative = Performative.INFORM
        message.sender = self.agent_id
        message.receiver = receiver
        message.content = belief_triples
        message.ontology = "https://w3id.org/fossr/ontology/bdi/"
        message.language = "turtle"
        
        return message
    
    def request_belief_confirmation(self, belief_uri: str, receiver: str) -> ACLMessage:
        """Create QUERY-IF message to confirm shared belief."""
        message = ACLMessage()
        message.performative = Performative.QUERY_IF
        message.sender = self.agent_id
        message.receiver = receiver
        message.content = f"ASK {{ <{belief_uri}> a bdi:Belief }}"
        message.language = "sparql"
        
        return message
    
    def propose_intention(self, intention_uri: str, receiver: str) -> ACLMessage:
        """Create PROPOSE message for coordinated intention."""
        intention_triples = self.store.get_intention_as_turtle(intention_uri)
        
        message = ACLMessage()
        message.performative = Performative.PROPOSE
        message.sender = self.agent_id
        message.receiver = receiver
        message.content = intention_triples
        message.ontology = "https://w3id.org/fossr/ontology/bdi/"
        
        return message
```

