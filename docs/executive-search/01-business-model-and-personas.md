# 01 — Business Model and Personas

## Retained-search product model

The firm specializes in Board of Director appointments, Board Chair and Lead Independent Director appointments, Advisory board appointments, CEO/President searches, C-Suite searches (CFO, COO, CTO, CIO, CMO, CPO, General Counsel), and senior leadership succession and talent-mapping engagements.

The unit of delivery is a **search assignment**, not merely a job. The executive relationship survives any one search. A candidacy can exist without an application. Passive outreach and warm introductions are first-class.

## End-to-end lifecycle

1. Prospect identified and relationship owner assigned.
2. BD opportunity qualified (conflict/off-limits feasibility preview).
3. Pitch, proposal, and engagement terms.
4. Won-to-assignment conversion.
5. Assignment kickoff: team, credits, discovery, search committee.
6. Position specification and search criteria (client-approved).
7. Research strategy and target-company universe.
8. Name generation, identity resolution, off-limits/conflict checks.
9. Outreach via relationship paths/warm introductions.
10. Qualification and internal assessment.
11. Calibration longlist.
12. Shortlist and client slate (consent-checked, versioned).
13. Candidate presentations (restricted-field scan).
14. Client feedback and calibration.
15. Interviews, scorecards, references, diligence.
16. Offer negotiation and placement.
17. Fee milestones, guarantee monitoring, onboarding follow-through.
18. Candidate care throughout: updates, closure, future-fit plans.

## Personas

### Internal

| Persona                          | Scope                                                                      | Key constraints                                                                         |
| -------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Managing partner                 | Firm-wide assignments, clients, revenue, credits, analytics                | Elevated waiver authority; no auto medical/demographic access                           |
| Search partner / lead consultant | Assigned clients/assignments, candidacy, slates, assessment, placement     | Can authorize presentation under policy; cannot override firm off-limits without waiver |
| Principal / engagement manager   | Operational assignment management, assessment, status reports              | Limited fee visibility by policy                                                        |
| Researcher / sourcer             | Research strategies, market maps, target companies, outreach prep          | No compensation, confidential references, diligence results, or client commercial terms |
| Project coordinator              | Scheduling, tasks, logistics, candidate communications, report assembly    | Limited assessment and commercial access                                                |
| Business-development leader      | Prospects, companies, people, CRM opportunities, pipeline                  | Does not receive broad candidacy confidential data unless assigned                      |
| Finance/operations               | Engagement terms, fees, installments, credits, placement, guarantee        | Candidate assessment minimized                                                          |
| Compliance/privacy officer       | Consents, privacy, retention, AI governance, audits, conflicts, off-limits | Read-only or controlled remediation                                                     |
| Practice-group leader            | Practice analytics, team performance                                       | Scoped to practice group                                                                |
| System administrator             | Configuration, roles, integrations                                         | Does not access selection data by default                                               |
| Integration developer            | API, event contracts, adapter code                                         | No production data access                                                               |

### External

| Persona                                  | System                      | Access                                                  |
| ---------------------------------------- | --------------------------- | ------------------------------------------------------- |
| Executive candidate                      | Directus (portal)           | Self-managed profile; not a Twenty workspace member     |
| Reference provider                       | Directus (token-based)      | Reference submission only                               |
| External affiliate / contract researcher | Twenty (time-bound)         | Assigned projects and approved research fields only     |
| Client search committee chair            | Twenty (restricted, future) | Assigned search, approved artifacts, no database browse |
| Client search committee member           | Twenty (restricted, future) | Assignment-specific, stage/field-specific view          |
| Client HR/talent leader                  | Twenty (restricted, future) | Assignment-specific                                     |
| Client executive sponsor                 | Twenty (restricted, future) | Assignment-specific                                     |

## Candidate care principles

1. Timely progress updates.
2. Confidentiality reminders.
3. Feedback and closure (no silent abandonment).
4. Future-fit relationship plan.
5. Consent renewal.
6. Do-not-contact and privacy.
7. Post-placement check-ins.

## Prior-plan item classification

| Item                                   | Status        | Reason                                                   |
| -------------------------------------- | ------------- | -------------------------------------------------------- |
| Replacement candidate portal in Twenty | DELETED       | Directus remains the portal; no duplicate portal created |
| High-volume applicant screening        | DEPRIORITIZED | Not relevant to retained search; extensibility preserved |
| Mass applicant pipeline                | DEPRIORITIZED | Retained-search essentials take priority                 |
| Internal headcount planning            | DEPRIORITIZED | Client HRIS-owned                                        |
| Employee referral programs             | DEPRIORITIZED | Not retained-search core                                 |
| Internal mobility                      | DEPRIORITIZED | Client HRIS-owned                                        |
| Onboarding task suites                 | DEPRIORITIZED | Client HRIS-owned                                        |
| Board composition and matrix           | RETAINED      | First-class Board/C-Suite feature                        |
| Confidential assignment support        | RETAINED      | Core executive-search requirement                        |
| Passive candidacy without application  | RETAINED      | Core executive-search requirement                        |
| Off-limits/conflict enforcement        | RETAINED      | Enforced, not advisory                                   |
| Candidate consent-to-present           | RETAINED      | Mandatory gate                                           |
| Commercial-selection firewall          | RETAINED      | Hard architectural boundary                              |
| Governed AI with human review          | RETAINED      | Evidence-based, human-reviewed                           |
| Client collaboration portal            | RETAINED      | Secure, scoped, versioned                                |
| Placement and guarantee tracking       | RETAINED      | Completes retained-search lifecycle                      |
