---
name: bdi-mental-states
description: This skill should be used when the user asks to "model agent mental states", "implement BDI architecture", "create belief-desire-intention models", "transform RDF to beliefs", "build cognitive agent", or mentions BDI ontology, mental state modeling, rational agency, or neuro-symbolic AI integration.
---

# BDI Mental State Modeling

Transform external RDF context into agent mental states (beliefs, desires, intentions) using formal BDI ontology patterns. This skill enables agents to reason about context through cognitive architecture, supporting deliberative reasoning, explainability, and semantic interoperability within multi-agent systems.

## When to Activate

Activate this skill when:
- Processing external RDF context into agent beliefs about world states
- Modeling rational agency with perception, deliberation, and action cycles
- Enabling explainability through traceable reasoning chains
- Implementing BDI frameworks (SEMAS, JADE, JADEX)
- Augmenting LLMs with formal cognitive structures (Logic Augmented Generation)
- Coordinating mental states across multi-agent platforms
- Tracking temporal evolution of beliefs, desires, and intentions
- Linking motivational states to action plans

## Core Concepts

### Mental Reality Architecture

**Mental States (Endurants)**: Persistent cognitive attributes
- `Belief`: What the agent believes to be true about the world
- `Desire`: What the agent wishes to bring about
- `Intention`: What the agent commits to achieving

**Mental Processes (Perdurants)**: Events that modify mental states
- `BeliefProcess`: Forming/updating beliefs from perception
- `DesireProcess`: Generating desires from beliefs
- `IntentionProcess`: Committing to desires as actionable intentions

### Cognitive Chain Pattern

```turtle
:Belief_store_open a bdi:Belief ;
    rdfs:comment "Store is open" ;
    bdi:motivates :Desire_buy_groceries .

:Desire_buy_groceries a bdi:Desire ;
    rdfs:comment "I desire to buy groceries" ;
    bdi:isMotivatedBy :Belief_store_open .

:Intention_go_shopping a bdi:Intention ;
    rdfs:comment "I will buy groceries" ;
    bdi:fulfils :Desire_buy_groceries ;
    bdi:isSupportedBy :Belief_store_open ;
    bdi:specifies :Plan_shopping .
```

### World State Grounding

Mental states reference structured configurations of the environment:

```turtle
:Agent_A a bdi:Agent ;
    bdi:perceives :WorldState_WS1 ;
    bdi:hasMentalState :Belief_B1 .

:WorldState_WS1 a bdi:WorldState ;
    rdfs:comment "Meeting scheduled at 10am in Room 5" ;
    bdi:atTime :TimeInstant_10am .

:Belief_B1 a bdi:Belief ;
    bdi:refersTo :WorldState_WS1 .
```

### Goal-Directed Planning

Intentions specify plans that address goals through task sequences:

```turtle
:Intention_I1 bdi:specifies :Plan_P1 .

:Plan_P1 a bdi:Plan ;
    bdi:addresses :Goal_G1 ;
    bdi:beginsWith :Task_T1 ;
    bdi:endsWith :Task_T3 .

:Task_T1 bdi:precedes :Task_T2 .
:Task_T2 bdi:precedes :Task_T3 .
```

## T2B2T Paradigm

Triples-to-Beliefs-to-Triples implements bidirectional flow between RDF knowledge graphs and internal mental states:

**Phase 1: Triples-to-Beliefs**
```turtle
# External RDF context triggers belief formation
:WorldState_notification a bdi:WorldState ;
    rdfs:comment "Push notification: Payment request $250" ;
    bdi:triggers :BeliefProcess_BP1 .

:BeliefProcess_BP1 a bdi:BeliefProcess ;
    bdi:generates :Belief_payment_request .
```

**Phase 2: Beliefs-to-Triples**
```turtle
# Mental deliberation produces new RDF output
:Intention_pay a bdi:Intention ;
    bdi:specifies :Plan_payment .

:PlanExecution_PE1 a bdi:PlanExecution ;
    bdi:satisfies :Plan_payment ;
    bdi:bringsAbout :WorldState_payment_complete .
```

## Notation Selection by Level

| C4 Level | Notation | Mental State Representation |
|----------|----------|----------------------------|
| L1 Context | ArchiMate | Agent boundaries, external perception sources |
| L2 Container | ArchiMate | BDI reasoning engine, belief store, plan executor |
| L3 Component | UML | Mental state managers, process handlers |
| L4 Code | UML/RDF | Belief/Desire/Intention classes, ontology instances |

## Justification and Explainability

Mental entities link to supporting evidence for traceable reasoning:

```turtle
:Belief_B1 a bdi:Belief ;
    bdi:isJustifiedBy :Justification_J1 .

:Justification_J1 a bdi:Justification ;
    rdfs:comment "Official announcement received via email" .

:Intention_I1 a bdi:Intention ;
    bdi:isJustifiedBy :Justification_J2 .

:Justification_J2 a bdi:Justification ;
    rdfs:comment "Location precondition satisfied" .
```

## Temporal Dimensions

Mental states persist over bounded time periods:

```turtle
:Belief_B1 a bdi:Belief ;
    bdi:hasValidity :TimeInterval_TI1 .

:TimeInterval_TI1 a bdi:TimeInterval ;
    bdi:hasStartTime :TimeInstant_9am ;
    bdi:hasEndTime :TimeInstant_11am .
```

Query mental states active at specific moments:

```sparql
SELECT ?mentalState WHERE {
    ?mentalState bdi:hasValidity ?interval .
    ?interval bdi:hasStartTime ?start ;
              bdi:hasEndTime ?end .
    FILTER(?start <= "2025-01-04T10:00:00"^^xsd:dateTime && 
           ?end >= "2025-01-04T10:00:00"^^xsd:dateTime)
}
```

## Compositional Mental Entities

Complex mental entities decompose into constituent parts for selective updates:

```turtle
:Belief_meeting a bdi:Belief ;
    rdfs:comment "Meeting at 10am in Room 5" ;
    bdi:hasPart :Belief_meeting_time , :Belief_meeting_location .

# Update only location component
:BeliefProcess_update a bdi:BeliefProcess ;
    bdi:modifies :Belief_meeting_location .
```

## Integration Patterns

### Logic Augmented Generation (LAG)

Augment LLM outputs with ontological constraints:

```python
def augment_llm_with_bdi_ontology(prompt, ontology_graph):
    ontology_context = serialize_ontology(ontology_graph, format='turtle')
    augmented_prompt = f"{ontology_context}\n\n{prompt}"
    
    response = llm.generate(augmented_prompt)
    triples = extract_rdf_triples(response)
    
    is_consistent = validate_triples(triples, ontology_graph)
    return triples if is_consistent else retry_with_feedback()
```

### SEMAS Rule Translation

Map BDI ontology to executable production rules:

```prolog
% Belief triggers desire formation
[HEAD: belief(agent_a, store_open)] / 
[CONDITIONALS: time(weekday_afternoon)] » 
[TAIL: generate_desire(agent_a, buy_groceries)].

% Desire triggers intention commitment
[HEAD: desire(agent_a, buy_groceries)] / 
[CONDITIONALS: belief(agent_a, has_shopping_list)] » 
[TAIL: commit_intention(agent_a, buy_groceries)].
```

## Guidelines

1. Model world states as configurations independent of agent perspectives, providing referential substrate for mental states.

2. Distinguish endurants (persistent mental states) from perdurants (temporal mental processes), aligning with DOLCE ontology.

3. Treat goals as descriptions rather than mental states, maintaining separation between cognitive and planning layers.

4. Use `hasPart` relations for meronymic structures enabling selective belief updates.

5. Associate every mental entity with temporal constructs via `atTime` or `hasValidity`.

6. Use bidirectional property pairs (`motivates`/`isMotivatedBy`, `generates`/`isGeneratedBy`) for flexible querying.

7. Link mental entities to `Justification` instances for explainability and trust.

8. Implement T2B2T through: (1) translate RDF to beliefs, (2) execute BDI reasoning, (3) project mental states back to RDF.

9. Define existential restrictions on mental processes (e.g., `BeliefProcess ⊑ ∃generates.Belief`).

10. Reuse established ODPs (EventCore, Situation, TimeIndexedSituation, BasicPlan, Provenance) for interoperability.

## Competency Questions

Validate implementation against these SPARQL queries:

```sparql
# CQ1: What beliefs motivated formation of a given desire?
SELECT ?belief WHERE {
    :Desire_D1 bdi:isMotivatedBy ?belief .
}

# CQ2: Which desire does a particular intention fulfill?
SELECT ?desire WHERE {
    :Intention_I1 bdi:fulfils ?desire .
}

# CQ3: Which mental process generated a belief?
SELECT ?process WHERE {
    ?process bdi:generates :Belief_B1 .
}

# CQ4: What is the ordered sequence of tasks in a plan?
SELECT ?task ?nextTask WHERE {
    :Plan_P1 bdi:hasComponent ?task .
    OPTIONAL { ?task bdi:precedes ?nextTask }
} ORDER BY ?task
```

## Anti-Patterns

1. **Conflating mental states with world states**: Mental states reference world states, they are not world states themselves.

2. **Missing temporal bounds**: Every mental state should have validity intervals for diachronic reasoning.

3. **Flat belief structures**: Use compositional modeling with `hasPart` for complex beliefs.

4. **Implicit justifications**: Always link mental entities to explicit justification instances.

5. **Direct intention-to-action mapping**: Intentions specify plans which contain tasks; actions execute tasks.

## Integration

- **RDF Processing**: Apply after parsing external RDF context to construct cognitive representations
- **Semantic Reasoning**: Combine with ontology reasoning to infer implicit mental state relationships
- **Multi-Agent Communication**: Integrate with FIPA ACL for cross-platform belief sharing
- **Temporal Context**: Coordinate with temporal reasoning for mental state evolution
- **Explainable AI**: Feed into explanation systems tracing perception through deliberation to action
- **Neuro-Symbolic AI**: Apply in LAG pipelines to constrain LLM outputs with cognitive structures

## References

See `references/` folder for detailed documentation:
- `bdi-ontology-core.md` - Core ontology patterns and class definitions
- `rdf-examples.md` - Complete RDF/Turtle examples
- `sparql-competency.md` - Full competency question SPARQL queries
- `framework-integration.md` - SEMAS, JADE, LAG integration patterns

Primary sources:
- Zuppiroli et al. "The Belief-Desire-Intention Ontology" (2025)
- Rao & Georgeff "BDI agents: From theory to practice" (1995)
- Bratman "Intention, plans, and practical reason" (1987)

