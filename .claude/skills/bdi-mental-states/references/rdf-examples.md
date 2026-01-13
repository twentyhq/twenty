# BDI RDF Examples

Complete RDF/Turtle examples for BDI mental state modeling.

## Complete Cognitive Workflow

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# ============================================================
# PHASE 1: World State Perception
# ============================================================

ex:WorldState_traffic a bdi:WorldState ;
    rdfs:comment "Heavy traffic on Route 101" ;
    bdi:atTime "2026-01-04T08:30:00"^^xsd:dateTime ;
    bdi:isPerceivedBy ex:Agent_commuter ;
    bdi:triggers ex:BeliefProcess_assess_traffic .

# ============================================================
# PHASE 2: Belief Formation
# ============================================================

ex:BeliefProcess_assess_traffic a bdi:BeliefProcess ;
    bdi:generates ex:Belief_traffic_delay ;
    bdi:reasonsUpon ex:WorldState_traffic ;
    bdi:isProcessedBy ex:Agent_commuter ;
    bdi:atTime "2026-01-04T08:31:00"^^xsd:dateTime .

ex:Belief_traffic_delay a bdi:Belief ;
    rdfs:label "Traffic will cause 30-minute delay" ;
    bdi:refersTo ex:WorldState_traffic ;
    bdi:hasValidity ex:TimeInterval_morning_commute ;
    bdi:hasPart ex:Belief_route_congested , ex:Belief_delay_duration ;
    bdi:isJustifiedBy ex:Justification_traffic_report ;
    bdi:motivates ex:Desire_arrive_on_time .

ex:Belief_route_congested a bdi:Belief ;
    rdfs:comment "Route 101 is congested" .

ex:Belief_delay_duration a bdi:Belief ;
    rdfs:comment "Delay estimated at 30 minutes" .

ex:Justification_traffic_report a bdi:Justification ;
    rdfs:label "Real-time traffic data from navigation system" ;
    bdi:justifies ex:Belief_traffic_delay .

# ============================================================
# PHASE 3: Desire Formation
# ============================================================

ex:DesireProcess_plan_arrival a bdi:DesireProcess ;
    bdi:generates ex:Desire_arrive_on_time ;
    bdi:reasonsUpon ex:Belief_traffic_delay ;
    bdi:isProcessedBy ex:Agent_commuter .

ex:Desire_arrive_on_time a bdi:Desire ;
    rdfs:label "I desire to arrive at work on time" ;
    bdi:isMotivatedBy ex:Belief_traffic_delay ;
    bdi:refersTo ex:WorldState_on_time_arrival .

# ============================================================
# PHASE 4: Intention Commitment
# ============================================================

ex:IntentionProcess_commit_route a bdi:IntentionProcess ;
    bdi:generates ex:Intention_take_alternate_route ;
    bdi:reasonsUpon ex:Desire_arrive_on_time ;
    bdi:isProcessedBy ex:Agent_commuter .

ex:Intention_take_alternate_route a bdi:Intention ;
    rdfs:label "I will take alternate route via Highway 280" ;
    bdi:fulfils ex:Desire_arrive_on_time ;
    bdi:isSupportedBy ex:Belief_traffic_delay ;
    bdi:specifies ex:Plan_alternate_commute ;
    bdi:isJustifiedBy ex:Justification_time_optimization .

ex:Justification_time_optimization a bdi:Justification ;
    rdfs:label "Alternate route saves 20 minutes based on current conditions" ;
    bdi:justifies ex:Intention_take_alternate_route .

# ============================================================
# PHASE 5: Planning
# ============================================================

ex:Planning_route_selection a bdi:Planning ;
    bdi:reasonsUpon ex:Intention_take_alternate_route ;
    bdi:defines ex:Plan_alternate_commute ;
    bdi:atTime ex:TimeInterval_planning_phase .

ex:Plan_alternate_commute a bdi:Plan ;
    rdfs:label "Alternate commute via Highway 280" ;
    bdi:addresses ex:Goal_arrive_by_9am ;
    bdi:beginsWith ex:Task_exit_Route101 ;
    bdi:endsWith ex:Task_arrive_parking ;
    bdi:hasComponent ex:Task_exit_Route101 , ex:Task_merge_280 , 
                     ex:Task_navigate_280 , ex:Task_arrive_parking .

ex:Task_exit_Route101 a bdi:Task ;
    rdfs:label "Exit Route 101 at Whipple Ave" ;
    bdi:precedes ex:Task_merge_280 .

ex:Task_merge_280 a bdi:Task ;
    rdfs:label "Merge onto Highway 280 North" ;
    bdi:precedes ex:Task_navigate_280 .

ex:Task_navigate_280 a bdi:Task ;
    rdfs:label "Continue on Highway 280 for 8 miles" ;
    bdi:precedes ex:Task_arrive_parking .

ex:Task_arrive_parking a bdi:Task ;
    rdfs:label "Arrive at office parking garage" .

ex:Goal_arrive_by_9am a bdi:Goal ;
    rdfs:label "Arrive at work by 9:00 AM" .

# ============================================================
# PHASE 6: Plan Execution
# ============================================================

ex:PlanExecution_commute a bdi:PlanExecution ;
    bdi:satisfies ex:Plan_alternate_commute ;
    bdi:addresses ex:Goal_arrive_by_9am ;
    bdi:isExecutedBy ex:Agent_commuter ;
    bdi:hasComponent ex:Action_exit , ex:Action_merge , 
                     ex:Action_drive_280 , ex:Action_park ;
    bdi:atTime ex:TimeInterval_execution ;
    bdi:bringsAbout ex:WorldState_arrived_on_time .

ex:Action_exit a bdi:Action ;
    bdi:isExecutionOf ex:Task_exit_Route101 ;
    bdi:isPerformedBy ex:Agent_commuter ;
    bdi:atTime "2026-01-04T08:35:00"^^xsd:dateTime .

ex:Action_merge a bdi:Action ;
    bdi:isExecutionOf ex:Task_merge_280 ;
    bdi:isPerformedBy ex:Agent_commuter ;
    bdi:atTime "2026-01-04T08:37:00"^^xsd:dateTime .

ex:Action_drive_280 a bdi:Action ;
    bdi:isExecutionOf ex:Task_navigate_280 ;
    bdi:isPerformedBy ex:Agent_commuter ;
    bdi:atTime "2026-01-04T08:40:00"^^xsd:dateTime .

ex:Action_park a bdi:Action ;
    bdi:isExecutionOf ex:Task_arrive_parking ;
    bdi:isPerformedBy ex:Agent_commuter ;
    bdi:bringsAbout ex:WorldState_arrived_on_time ;
    bdi:atTime "2026-01-04T08:52:00"^^xsd:dateTime .

# ============================================================
# PHASE 7: Resulting World State
# ============================================================

ex:WorldState_arrived_on_time a bdi:WorldState ;
    rdfs:comment "Agent arrived at work at 8:52 AM" ;
    bdi:atTime "2026-01-04T08:52:00"^^xsd:dateTime .

# ============================================================
# TEMPORAL INTERVALS
# ============================================================

ex:TimeInterval_morning_commute a bdi:TimeInterval ;
    bdi:hasStartTime "2026-01-04T08:30:00"^^xsd:dateTime ;
    bdi:hasEndTime "2026-01-04T09:00:00"^^xsd:dateTime .

ex:TimeInterval_planning_phase a bdi:TimeInterval ;
    bdi:hasStartTime "2026-01-04T08:31:00"^^xsd:dateTime ;
    bdi:hasEndTime "2026-01-04T08:34:00"^^xsd:dateTime .

ex:TimeInterval_execution a bdi:TimeInterval ;
    bdi:hasStartTime "2026-01-04T08:35:00"^^xsd:dateTime ;
    bdi:hasEndTime "2026-01-04T08:52:00"^^xsd:dateTime .
```

## Multi-Agent Coordination Example

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix ex: <http://example.org/> .
@prefix fipa: <http://www.fipa.org/specs/fipa00061/> .

# Shared belief about project deadline
ex:Agent_developer a bdi:Agent ;
    bdi:hasMentalState ex:Belief_deadline_friday .

ex:Agent_manager a bdi:Agent ;
    bdi:hasMentalState ex:Belief_deadline_friday .

ex:Belief_deadline_friday a bdi:Belief ;
    rdfs:label "Project deadline is Friday 5 PM" ;
    bdi:refersTo ex:WorldState_deadline ;
    bdi:hasValidity ex:TimeInterval_project_week .

ex:WorldState_deadline a bdi:WorldState ;
    rdfs:comment "Project XYZ must be delivered by 2026-01-10T17:00:00" .

# Agent-specific mental states
ex:Agent_developer 
    bdi:hasDesire ex:Desire_complete_coding ;
    bdi:hasIntention ex:Intention_implement_features .

ex:Desire_complete_coding a bdi:Desire ;
    rdfs:label "Complete feature implementation" ;
    bdi:isMotivatedBy ex:Belief_deadline_friday .

ex:Intention_implement_features a bdi:Intention ;
    rdfs:label "Implement features A, B, and C" ;
    bdi:fulfils ex:Desire_complete_coding ;
    bdi:specifies ex:Plan_development .

ex:Agent_manager 
    bdi:hasDesire ex:Desire_ensure_delivery ;
    bdi:hasIntention ex:Intention_coordinate_team .

ex:Desire_ensure_delivery a bdi:Desire ;
    rdfs:label "Ensure on-time project delivery" ;
    bdi:isMotivatedBy ex:Belief_deadline_friday .

ex:Intention_coordinate_team a bdi:Intention ;
    rdfs:label "Coordinate team activities" ;
    bdi:fulfils ex:Desire_ensure_delivery ;
    bdi:specifies ex:Plan_project_management .

# FIPA communication
ex:Message_M1 a fipa:ACLMessage ;
    fipa:sender ex:Agent_manager ;
    fipa:receiver ex:Agent_developer ;
    fipa:content ex:Belief_deadline_friday ;
    fipa:performative fipa:inform .
```

## Conflict Resolution Example

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix ex: <http://example.org/> .

# Conflicting location beliefs
ex:Belief_at_home a bdi:Belief ;
    bdi:refersTo ex:WorldState_home ;
    rdfs:comment "Agent is currently at home" .

ex:Belief_at_office a bdi:Belief ;
    bdi:refersTo ex:WorldState_office ;
    rdfs:comment "Agent is at office" .

# Conflicting intentions
ex:Intention_work_from_home a bdi:Intention ;
    bdi:isSupportedBy ex:Belief_at_home ;
    rdfs:label "Work from home today" .

ex:Intention_attend_meeting a bdi:Intention ;
    bdi:isSupportedBy ex:Belief_at_office ;
    rdfs:label "Attend in-person meeting" .

# Justification for conflict resolution
ex:Justification_location_conflict a bdi:Justification ;
    rdfs:comment "Cannot simultaneously be at home and office" ;
    bdi:justifies ex:Intention_resolution .

# Resolved intention
ex:Intention_resolution a bdi:Intention ;
    rdfs:label "Attend meeting via video call from home" ;
    bdi:fulfils ex:Desire_meeting_participation ;
    bdi:isSupportedBy ex:Belief_at_home ;
    bdi:isJustifiedBy ex:Justification_location_conflict .
```

## T2B2T Payment Processing Example

```turtle
@prefix bdi: <https://w3id.org/fossr/ontology/bdi/> .
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# PHASE 1: Triples-to-Beliefs (External RDF → Internal Mental State)

ex:WorldState_notification a bdi:WorldState ;
    rdfs:comment "Push notification: Ghadeh requested $250 via Zelle" ;
    bdi:atTime "2025-10-27T10:15:00"^^xsd:dateTime ;
    bdi:triggers ex:BeliefProcess_BP1 .

ex:BeliefProcess_BP1 a bdi:BeliefProcess ;
    bdi:generates ex:Belief_payment_request ;
    bdi:isProcessedBy ex:Agent_A .

ex:Belief_payment_request a bdi:Belief ;
    rdfs:label "Ghadeh requested $250" ;
    bdi:refersTo ex:WorldState_notification ;
    bdi:motivates ex:Desire_pay_Ghadeh .

ex:Desire_pay_Ghadeh a bdi:Desire ;
    rdfs:label "Pay Ghadeh $250" ;
    bdi:isMotivatedBy ex:Belief_payment_request .

ex:Intention_I1 a bdi:Intention ;
    rdfs:label "Pay Ghadeh $250" ;
    bdi:fulfils ex:Desire_pay_Ghadeh ;
    bdi:specifies ex:Plan_payment .

# PHASE 2: Beliefs-to-Triples (Mental State → External RDF)

ex:PlanExecution_PE1 a bdi:PlanExecution ;
    bdi:satisfies ex:Plan_payment ;
    bdi:bringsAbout ex:WorldState_payment_complete .

ex:WorldState_payment_complete a bdi:WorldState ;
    rdfs:comment "Payment of $250 sent to Ghadeh via Zelle" ;
    bdi:atTime "2025-10-27T10:20:00"^^xsd:dateTime .
```

