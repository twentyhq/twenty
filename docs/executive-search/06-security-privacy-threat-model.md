# 06 — Security, Privacy, and Threat Model

## Purpose

Document assets, actors, trust boundaries, abuse cases, and security controls for the Executive Search Operating System, with emphasis on tenant/client isolation, confidentiality, and data-firewall enforcement.

## Assets

| Asset                                             | Sensitivity       | Protection                                                                  |
| ------------------------------------------------- | ----------------- | --------------------------------------------------------------------------- |
| Candidate-confidential candidacy data             | High              | Field-level permissions, RLS, consent gates, restricted-field leakage scans |
| Client-confidential assignment data               | High              | Tenant + client-scoped RLS, client collaboration boundary                   |
| Off-limits and conflict data                      | High              | Guard enforcement, audit, permission-safe explanations                      |
| Restricted references and diligence               | High              | Restricted permissions, consent/legal-basis tracking                        |
| Compensation data                                 | Restricted        | Field-level read permissions, non-selection                                 |
| Voluntary demographics / medical / accommodations | Restricted        | Absolute isolation from evaluators, compliance-only access                  |
| Commercial/subscription data                      | Firewall-isolated | ORM field-permission exclusion, automated leakage tests                     |
| Authentication secrets                            | Critical          | Never replicated; absolute no-sync                                          |
| Internal AI evidence and prompts                  | High              | Redaction, context allowlists, guardrails, human review                     |
| Research provenance and market maps               | High (firm IP)    | Assignment-confidential, client-scoped                                      |

## Actors and trust boundaries

| Actor                   | Trust level                 | Boundary                                                                                   |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| Managing partner        | Internal, elevated          | Firm-wide; no medical/demographic detail without separate grant                            |
| Search partner          | Internal, assignment-scoped | Owned clients/assignments; cannot override firm off-limits without waiver                  |
| Researcher/sourcer      | Internal, limited           | Research fields only; no compensation, confidential references, or client commercial terms |
| Client committee member | External, highly restricted | Assignment-specific, shared records only; no database browse                               |
| Executive candidate     | External (Directus)         | Portal only; not a Twenty workspace member                                                 |
| External affiliate      | External, time-bound        | Assigned projects only; no broad export                                                    |
| Integration system      | System                      | Field ownership enforcement, idempotency, echo prevention                                  |

## Abuse cases and mitigations

| Threat                                                              | Mitigation                                                                                                      |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Cross-workspace data leakage                                        | Tenant isolation suite; workspace-scoped queries enforced in ORM                                                |
| Cross-client data leakage (client sees another client's candidates) | Client-scoped RLS; client isolation suite                                                                       |
| Client enumerating unshared candidates                              | Client cannot search executive database; assignment-scoped records only                                         |
| Directus webhook forgery                                            | HMAC signature verification; nonce; replay dedup                                                                |
| Replay attacks                                                      | Idempotency keys, event dedup, bounded replay window                                                            |
| Secret leakage in logs                                              | Redaction manifest; secrets never logged; payload minimization                                                  |
| IDOR through external IDs                                           | externalEntityLink is workspace-scoped; external IDs not directly addressable                                   |
| File URL leakage                                                    | Secure file references; no raw storage paths; signed access                                                     |
| Stored XSS in bios/resumes/reports                                  | Output encoding; input sanitization                                                                             |
| SSRF through external research URLs                                 | URL allowlisting; outbound network policy                                                                       |
| CSV formula injection                                               | Formula-safe CSV generation; validator checks                                                                   |
| Prompt injection through resumes/bios/notes/references              | Input isolation; AI guardrails; human review before client-facing output                                        |
| AI tool permission bypass                                           | Role-scoped tools; capability flags; kill switches                                                              |
| Off-limits guard bypass                                             | Guard is mandatory in all outreach/presentation/assignment flows; override requires elevated permission + audit |
| Field-permission bypass                                             | ORM-enforced field-read; `SELECT *` blocked when restrictions exist                                             |
| Candidate identity disclosure leak                                  | Disclosure consent gate; masked presentations                                                                   |
| Commercial/protected field leakage                                  | Automated firewall tests; context allowlists; search-index exclusion                                            |
| Log/cache key leakage                                               | Structured logging with correlation; cache keys workspace-scoped                                                |

## Tenant and client isolation

Twenty's existing permission engine enforces object-level, field-level, and row-level permissions at the ORM layer (`engine/twenty-orm/repository/permissions.utils.ts`). Field-read restrictions are enforced even on `SELECT *` queries. Row-level predicates inject WHERE clauses via `apply-row-level-permission-predicates.util.ts`.

The Executive Search OS extends this with:

- Client-scoped RLS predicates for all client-collaboration records.
- Separate permission sets for each internal persona (partner, researcher, coordinator, finance, compliance).
- Commercial-firewall field exclusions on search-delivery roles.
- Assessment isolation (independent assessors cannot see others' drafts).

## Privacy controls

- Candidate consent states tracked per candidacy and per presentation.
- Do-not-contact flags and reasons.
- Retention/legal-hold propagation across both systems.
- Privacy deletion reconciles across Directus and Twenty.
- Medical/accommodation data isolated from evaluators by field, record, and permission.
- Voluntary demographics never enter individual search, AI, or client contexts.

## AI security

See `08-ai-governance.md` for the full AI security model. Key controls:

- Context builder redacts secrets, medical, demographic, and commercial data before AI input.
- Prompt injection defenses on all untrusted inputs (resumes, bios, notes, references).
- Kill switches per AI capability.
- Human review required before any candidate-affecting output is used.
- No emotion, facial, voice personality, or accent analysis.
