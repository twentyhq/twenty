# XO Pure Digital Twin — Agent Runtime Boundary

**Date**: 2026-06-19  
**Status**: Recommended — pending implementation  
**Prior Art**: cookbook-cook-ticketing-analysis (Pattern A+), tier1-canonical-field-mapping, xopure-crm app surface

## Who this is for

Internal operator or engineer tasked with turning XO Pure Digital Twin spreadsheet
rows into running AI agent employees. After reading, you should be able to
decide where any given agent lives — Twenty or Multica — and implement the
correct event flow.

## Executive decision

**Use a hybrid architecture.**

- **Twenty CRM** owns business state, canonical agent manifests,
  CRM objects/work queues, approval/confidence fields, UI/review surfaces,
  roles/permissions, and record-level audit.
- **Multica** owns runtime execution, autonomous background agents,
  MCP/env/tool access, autopilots with cron/webhook/manual triggers,
  issues/tasks/run logs, and human-in-loop operational gates.

Never make Multica the system of record for any business data.
Never let Twenty agents be the only runtime for autonomous reasoning loops.

## Decision matrix

| Layer | Twenty (CRM) | Multica (Runtime) |
|---|---|---|
| **Data ownership** | System of record — all business objects, relations, fields | Execution context only — issue metadata KV, run logs, transient task state |
| **Agent manifests** | `defineAgent` / `defineSkill` as canonical, version-controlled registry | Agent `--instructions` / skills as runtime configuration |
| **Work queues** | CRM objects with status lifecycle (QUEUED→RUNNING→DONE) — the authoritative queue manifest | Issue lifecycle (backlog→todo→in_progress→in_review→done) — the execution pipeline |
| **Execution** | Lightweight logic functions (route, cron, database-event) | Full model execution with tool calling, MCP, streaming |
| **Scheduling** | Simple cron for sync/reconciliation | Autopilot with cron expression + IANA timezone + webhook + manual dispatch |
| **Human approvals** | Approval status fields on CRM records; role-restricted writes | Issue `in_review` operational gate + status change callback to CRM |
| **Audit logs** | Activity feed (record mutation audit) | Run logs + run-messages (full agent reasoning trail) |
| **Access control** | Row-level + field-level roles (admin, manager, rep) | Agent visibility scoping (private/workspace); API key scoping for CRM access |
| **UI** | Front components + views + page layouts | None — agent outputs rendered in Twenty |
| **Retry / resilience** | None — single-shot triggers | cancel-task, rerun, webhook URL rotation |

## CRM-first event flow

CRM is the single writer. Multica consumes events and produces results.

```
1. CRM record created or updated
   (enrichment_task.status=QUEUED, new ticket, content draft submitted)

2. Twenty logic function emits webhook to Multica autopilot URL
   (includes CRM record UUID as idempotency key)

3. Multica autopilot creates issue/task, assigns agent

4. Multica agent reads CRM data via scoped REST/GraphQL/MCP API

5. Agent executes: reasons, calls tools, builds result

6. Agent writes result back to Twenty:
   - result summary, confidence score, status update
   - human_review_needed flag if confidence < threshold

7. If human_review_needed: issue status → in_review
   Human reviews in Multica, sets done
   Status change triggers final CRM update via agent callback
```

Idempotency: CRM record UUID is the deduplication key.
Replay a webhook event safely — Multica skips already-processed record IDs.

## What implements where

### Stay in Twenty (CRM native)

- Customer, ambassador, order, commission, prospect data
- Ticket objects with structured fields and relations
- Compliance review queues, claim library, compliance rules
- Approval status, confidence score, reviewer, timestamps
- Row-level permissions (ambassador admin/manager/rep roles)
- Durable reports, dashboards, operating views
- `defineAgent` and `defineSkill` as canonical source-of-truth prompts

### Run in Multica (orchestration)

- Scheduled prospect research and enrichment scans
- Compliance content review (risk flagging, safer rewrite generation)
- Confidence-scored triage routing
- Human-in-loop approval workflows (in_review gate, comments, decisions)
- External tool/MCP-backed tasks (enrichment providers, claim databases)
- Retryable task execution and agent coordination
- Agent run logs and reasoning audit trails
- Webhook ingestion with URL rotation

## MVP recommendation

Two valid first slices, ranked:

### Option 1: Compliance Shield (recommended for Digital Twin MVP)

Claims Compliance, Earnings Claims Compliance, Influencer Disclosure.
Three agents sharing 3 CRM objects (`complianceReview`, `claimLibrary`, `complianceRule`)
and 2 skills.

- Twenty: objects, approval fields, review UI
- Multica: review execution, risk flagging, human routing

### Option 2: Research & Enrichment (fastest path)

Existing `xopure-research-agent`, `xopure-contact-enrichment`, `xopureEnrichmentTask`
already scaffolded. Extend to autonomous scheduling via Multica autopilot.

## Implementation rules

1. **CRM writes first, always.** No business record is created in Multica.
   CRM is the authoritative source of truth.
2. **Scope Multica's Twenty API key to least privilege.**
   Only the objects/fields the agent needs to read/write.
3. **Do not use Multica labels/metadata as source of truth.**
   The API read-back gap is documented (tier1-canonical-field-mapping.md).
   Store labels, routing fields, and confidence scores in CRM object fields.
   Multica reads CRM — never relies on its own label/metadata GET.
4. **CRM permissions are the safety boundary.**
   Multica has no CRM-native row-level permissions.
   Enforce data access via the Twenty API key scope.
5. **Agent prompts are version-controlled in Twenty.**
   `defineAgent` and `defineSkill` sources are canonical.
   Sync to Multica agent instructions on deploy.
6. **Every agent action logs to CRM Activity.**
   Audit trail must be visible in Twenty, not buried in Multica run logs alone.

## Known risks

| Risk | Severity | Mitigation |
|---|---|---|
| Dual-write desync | Critical | CRM-first outbox; Multica never writes business state first |
| Multica label/metadata read-back broken | High | Store all routing/score fields in CRM; never query Multica for them |
| Multica daemon single point of failure | Medium | Autopilots pause on daemon down; CRM data unaffected; webhook events queued for retry |
| Agent inherits user's role in Twenty | Medium | Scope Twenty API key per agent; don't rely on `canBeAssignedToAgents` for permissions |
| Twenty `defineAgent` has no runtime model | Medium | Use Twenty for manifest only; execution always in Multica |
| No SLA engine in either system | Medium | Build as external cron querying CRM; Multica enforces via issue due_date when available |

## Open follow-up issues

- X0-33: Decide Twenty vs Multica agent runtime boundary (this document closes)
- X0-30: Remove plaintext xo_readonly credential from xo-schema doc
- X0-34: Fix sh3d pass-through AbortSignal crash
- X0-36: Fix Multica issue identifier workspace collision

## References

- cookbook-cook-ticketing-analysis — Pattern A+ architecture and dual-write gaps
- tier1-canonical-field-mapping — Multica label/metadata read-back gap evidence
- hosting-ticketing-audit — twenty-multica-tickets app status
- xopure-crm app — existing agent/skill/object/trigger surfaces
- XO Pure Digital Twin sheet — 43 agent rows, 9 columns, 37 role clusters
