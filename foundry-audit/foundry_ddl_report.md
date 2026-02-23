# Foundry DDL Generation Report

## Summary

| Metric | Count |
|--------|-------|
| Object types in export | 341 |
| Excluded (example/deprecated/test) | 36 |
| **Tables generated** | **305** |
| Total columns | 4808 |
| Foreign key constraints | 291 |
| FK constraints skipped | 33 |
| Junction tables | 15 |
| Junction tables skipped | 3 |
| Intermediary (object-backed) links | 7 |

## Output Files

- `foundry_ddl.sql` — CREATE TABLE statements (305 tables)
- `foundry_fk.sql` — FOREIGN KEY constraints (291 constraints)
- `foundry_junction.sql` — Junction tables for M:N relations (15 tables)

## Excluded Object Types

| apiName | Display Name | Reason |
|---------|-------------|--------|
| AgentFluent | Agent [Fluent][DEPR] | deprecated (display name) |
| ClusterLlmFluent | Cluster LLM [Fluent][DEPR] | deprecated (display name) |
| CustomerFluent | Customer [Fluent][DEPR] | deprecated (display name) |
| DevTestObjectForOsdkApp | [Dev] Test Object For OSDK App | test object |
| ExampleAircraft | [Example] Aircraft | example |
| ExampleAirport | [Example] Airport | example |
| ExampleCarrier | [Example] Carrier | example |
| ExampleExplainer | [Example] Explainer | example |
| ExampleFlight | [Example] Flight | example |
| ExampleFlightSensor | [Example] Flight Sensor | example |
| ExampleLogUpdateRouteAlertStatus | [Example][Log] Update Route Alert Status | example |
| ExampleRb87osdkTodoProject | [Example rb87] OSDK to-do project | example |
| ExampleRb87osdkTodoTask | [Example rb87] OSDK to-do task | example |
| ExampleRoute | [Example] Route | example |
| ExampleRouteAlert | [Example] Route Alert | example |
| ExampleRouteAlertComment | [Example] Route Alert Comment | example |
| ExampleRunway | [Example] Runway | example |
| FbloopsCustomerSupportFeedback | [Fbloops] Customer Support Feedback | example |
| FbloopsCustomerSupportInstruction | [Fbloops] Customer Support Instruction | example |
| GhlContactV2 | [Funnelbox] Contact | deprecated (status) |
| IssueChangeHistoryFluent | Issue Change History [Fluent][DEPR] | deprecated (display name) |
| IssueFluent | Issue [Fluent][DEPR] | deprecated (display name) |
| IssueFluentComment | Issue Comment [Fluent][DEPR] | deprecated (display name) |
| IssueResponseDraftHistoryFluent | Issue Response Draft History [Fluent][DEPR] | deprecated (display name) |
| IssueResponseFluent | Issue Response [Fluent][DEPR] | deprecated (display name) |
| JaneOrder | Jane Order | example |
| LogWebhookSendToGhlEnzoTest | [Log] Webhook send to GHL Enzo Test | test object |
| MetricsZoom_1 | [DEPR][Zoom] Metrics | deprecated (status) |
| PdfTestObjectType | PDF test Object type | test object |
| Quiz_OnboardingResponses_Fluent123 | Quiz Onboarding Responses [Fluent][DEPR] | deprecated (display name) |
| RatesurveyanswerChore | [Ratesurveyanswer] Chore | example |
| RatesurveyanswerRoommate | [Ratesurveyanswer] Roommate | example |
| TicketClusterFluent | Ticket Cluster [Fluent][DEPR] | deprecated (display name) |
| TicketIssueStatsFluent | Ticket-Issue Stats [Fluent][DEPR] | deprecated (display name) |
| WahaMessage | [Waha] Message | deprecated (status) |
| insightsLeadProfile | [deprecated] Lead Profile | deprecated (display name) |

## Skipped FK Constraints

| Relation ID | Reason |
|-------------|--------|
| cvkdqgky.ghl-form-q-a-ghl-contact-v-2 | references excluded type |
| cvkdqgky.one-state-aircraft-one-state-carriers | references excluded type |
| cvkdqgky.flights-one-state-carriers | references excluded type |
| cvkdqgky.log-fluent-create-new-cluster-for-ticket-log-link-type-cluster-llm-fluent | references excluded type |
| cvkdqgky.osdk-todo-task-osdk-todo-project | references excluded type |
| cvkdqgky.customer-fluent-ticket-fluent | references excluded type |
| cvkdqgky.roommate-chore | references excluded type |
| cvkdqgky.id-61908048-675e-63dc-f57a-792908e276bd | references excluded type |
| cvkdqgky.id-f31bb49c-b240-1c29-c3b8-fac5a54107cc | references excluded type |
| cvkdqgky.ghl-tob-user-ghl-contact-v2 | references excluded type |
| cvkdqgky.id-match-metrics-zoom-mid-2025 | references excluded type |
| cvkdqgky.id-match-ghl-contact-v-2 | references excluded type |
| cvkdqgky.funnelbox-contact-ghl-video-tracking | references excluded type |
| cvkdqgky.whats-app-chat-ghl-contact-v2 | references excluded type |
| cvkdqgky.ghl-contact-ghl-message-v2 | references excluded type |
| cvkdqgky.ghl-contact-ghl-schmerzfrei-umfrage-v2 | references excluded type |
| cvkdqgky.insight-type-response-aggregated-ghl-contact-v-2 | references excluded type |
| cvkdqgky.agent-fluent-ticket-fluent | references excluded type |
| cvkdqgky.log-one-state-route-alert-update-status-log-link-type-route-alert | references excluded type |
| cvkdqgky.flights-one-state-airports | references excluded type |
| cvkdqgky.one-state-routes-one-state-airports1 | references excluded type |
| cvkdqgky.flights-one-state-airports1 | references excluded type |
| cvkdqgky.one-state-routes-one-state-airports | references excluded type |
| cvkdqgky.route-alert-comment-route-alert | references excluded type |
| cvkdqgky.route-alert-one-state-routes | references excluded type |
| cvkdqgky.issue-fluent-issue-fluent-comment | references excluded type |
| cvkdqgky.ticket-fluent-issue-fluent | references excluded type |
| cvkdqgky.issue-response-draft-history-fluent-issue-fluent | references excluded type |
| cvkdqgky.cvkdqgky-knowledge-base-q-a-issue-fluent | references excluded type |
| cvkdqgky.flights-one-state-routes | references excluded type |
| cvkdqgky.ticket-issue-stats-fluent-ticket-fluent | references excluded type |
| cvkdqgky.flight-sensor-flights | references excluded type |
| cvkdqgky.one-state-aircraft-flights | references excluded type |

## Skipped Junction Tables

| Relation ID | Reason |
|-------------|--------|
| cvkdqgky.ticket-fluent-cluster-llm-fluent | references excluded type |
| cvkdqgky.issue-fluent-cluster-llm-fluent | references excluded type |
| cvkdqgky.one-state-airports-runway | references excluded type |

## Intermediary (Object-Backed) Links

These are many-to-many relationships backed by a full object type (not a simple junction table).
The intermediary object type is already generated as its own table — no extra junction table needed.

| Relation ID | Side A | Intermediary Object | Side B |
|-------------|--------|-------------------|--------|
| cvkdqgky.customerv2-program | Program | Subscription | Customer |
| cvkdqgky.id-f6d5029e-ed29-f0b9-30cc-022b9c7cb6b2 | Program | Subscription | AppUser |
| cvkdqgky.id-878db0de-90b1-d332-8044-bab37c6dcceb | Subscription | SessionParticipationSubscription | SessionParticipation |
| cvkdqgky.id-89a1e1dc-b321-47c5-da76-756f4f9ef5a1 | AppModule | SubscriptionModuleProgress | Subscription |
| cvkdqgky.id-16604e3d-e512-935e-dc99-7e8c6a911897 | AppLecture | AppModuleAppLectureLink | AppModule |
| cvkdqgky.id-48e803dd-cf93-47f7-11ff-d05eb8986992 | AppModule | ProgramAppModuleLink | Program |
| cvkdqgky.id-63e9a550-3f18-3b64-72b1-9342fc4b5a7b | AppSession | SessionParticipation | AppUser |

## Foundry Type → PostgreSQL Mapping Used

| Foundry Type | PostgreSQL Type |
|-------------|----------------|
| ARRAY | `JSONB` |
| BOOLEAN | `BOOLEAN` |
| DATE | `DATE` |
| DECIMAL | `NUMERIC` |
| DOUBLE | `DOUBLE PRECISION` |
| FLOAT | `REAL` |
| GEOHASH | `DOUBLE PRECISION[]` |
| GEOSHAPE | `JSONB` |
| INTEGER | `INTEGER` |
| LONG | `BIGINT` |
| MEDIA_REFERENCE | `JSONB` |
| SHORT | `SMALLINT` |
| STRING | `TEXT` |
| STRUCT | `JSONB` |
| TIMESTAMP | `TIMESTAMPTZ` |
| TIME_DEPENDENT | `JSONB` |
| VECTOR | `DOUBLE PRECISION[]` |
