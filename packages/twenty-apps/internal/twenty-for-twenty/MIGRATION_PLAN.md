# Twenty for Twenty — Migration & Cleanup Plan

Status: proposal · Owner: platform team

This document tracks the work to move the internal Twenty workspace from a
hand-built configuration (objects, fields, and workflows created through the UI)
into a versioned, deployable **app** — the way the Resend module in this package
already is.

> Figures below were taken from a live read of the internal workspace's metadata
> and core GraphQL APIs. Domain descriptions are kept intentionally generic.

## Why

Almost none of the internal CRM is codified. The bulk of the configuration lives
inside the workspace's seeded **"Custom application"** container, which means it
cannot be versioned, reviewed, or redeployed. Codifying it as app modules makes
it reproducible, reviewable, and portable across environments.

Snapshot of the workspace:

| Surface | Count |
|---|---|
| Installed apps | 21 |
| Objects | 46 |
| Hand-added custom fields | 341 |
| Workflows | 44 (30 active) |
| Views | 134 |
| Page layouts | 50 |

## The four apps named "Twenty for Twenty"

The name collides four ways; disambiguating them is the map for everything else.

| Application | Ver | Obj | What it is | Role |
|---|---|---|---|---|
| **Twenty for Twenty** | 0.2.0 | 7 | The official codified app in this package — Resend module only. | Keep & grow |
| **Twenty for twenty** (lowercase) | 0.3.36 | 3 | A second codified app: workspace metrics, meeting briefs, a few drafted emails. Migration already started here. | Consolidate |
| **…'s custom application** | 1.0.0 | 10 | The seeded "Custom" container. Everything built in the UI lands here: 10 objects, 341 fields, all 44 workflows (as auto-generated code steps + agents). | Seeded · drain |
| **Twenty Standard** | 1.0.0 | 25 | The base data model. Untouched. | Seeded |

**Core insight:** "migrating what's manually built" means *draining the seeded
Custom application* into versioned app modules. The hundreds of functions and
agents inside it are not hand-written — they are the compiled backing of UI
workflows. The real hand-authored assets are the **10 objects, 341 fields, and
44 workflow definitions**.

## What's manually built — the migration inventory

### Custom objects (10)

Grouped by domain:

- **Product-usage / telemetry** — the largest cluster; tracks cloud workspace and
  user activity, ~106 fields across three related objects.
- **Sales enablement** — meeting notes/briefs and demo/test data (~30 fields).
- **GTM & enrichment** — customer content and an enrichment audit trail (~25 fields).
- **Legacy / ops** — a pre-app call-recording model (superseded by the Call
  Recorder app) and a workflow-run archive (~22 fields).

### Custom fields on standard objects (214)

The highest-value and highest-risk to migrate, because they change how core CRM
objects behave:

| Standard object | Fields | Themes |
|---|---|---|
| person | 42 | product activity, partner program, enrichment |
| company | 41 | product activity, firmographics, partner |
| opportunity | 15 | sales attributes |
| workspaceMember | 10 | partner-managed relations |
| workflow | 5 | test/scope/theme flags |
| attachment · noteTarget · taskTarget · timelineActivity | 10×4 | auto-created morph targets — migrate implicitly with their objects |
| note · task | 3 | misc relations |

## Automation layer — 44 workflows

Workflows cannot yet be authored inside an app, but every trigger and nearly
every step type has a code equivalent. The question is how much rewrite per step.

**Triggers** (all have app equivalents): 15 database-event, 10 manual, 3 cron, 2 webhook.

**Step mix** (~230 steps): CODE 51 · UPDATE_RECORD 36 · FILTER 31 · FIND_RECORDS 18 ·
IF_ELSE 16 · LOGIC_FUNCTION 12 · HTTP_REQUEST 10 · DRAFT/SEND_EMAIL 11 · AI_AGENT 5 ·
FORM/DELAY 2.

**Migratability by step family:**

| Family | Effort |
|---|---|
| Code & logic-fn (`CODE`, `LOGIC_FUNCTION`) | 1:1 — already code |
| Control flow (`FILTER`, `IF_ELSE`, `ITERATOR`) | easy — JS conditionals |
| Record ops (`FIND`/`UPDATE`/`CREATE`/`UPSERT`) | straightforward via the client SDK |
| HTTP (`HTTP_REQUEST`) | straightforward via `fetch` |
| Email (`DRAFT_EMAIL`, `SEND_EMAIL`) | **blocked** — no app email primitive yet |
| AI agents (`AI_AGENT`) | needs `defineAgent` support |
| Interactive (`FORM`, `DELAY`) | redesign required |

~85% of steps port with little or no rewrite. The lowercase "Twenty for twenty"
app already proves the pattern — several of its logic functions are workflows
that were rewritten as hand-authored functions. Reuse that structure.

## Apps cleanup

| Application(s) | Disposition | Why |
|---|---|---|
| Call Recorder · People Data Labs · Exa · Self Hosting | **Keep** | maintained, single-purpose, packaged |
| Twenty for Twenty + lowercase twin | **Consolidate** | two apps, one purpose |
| Twenty Standard · Custom application | **Can't remove** | seeded system containers (Custom gets drained) |
| Fake Twenty for Twenty | **Remove** | local test app, dev leftover |
| Hello World | **Remove** | scaffolding example |
| Duplicate OAuth registrations (Codex, Claude, ChatGPT, Cursor, CLI) | **Dedupe** | keep one per tool, revoke blank duplicates |

~9 apps can be pruned immediately with no data impact — pure hygiene.

## The plan

### Phase 0 — Decide topology & validate adoption (prerequisite)

Two decisions unblock everything:

1. **App topology** — recommend **one modular `twenty-for-twenty` app** with
   `modules/{plg,partner,sales,gtm,enrichment}` (mirrors today's Resend module),
   keeping Call Recorder / PDL / Exa standalone.
2. **Adoption semantics** — **the critical unknown:** can a published app *adopt*
   existing objects/fields by `universalIdentifier`, or does publishing recreate
   them and collide with live data? Validate on one throwaway field in a scratch
   workspace before scoping anything else.

### Phase 1 — Prune the workspace (quick win, no data impact)

Remove Fake Twenty for Twenty and Hello World; revoke duplicate OAuth
registrations. Warn on exactly what each uninstall removes, and verify after each.

### Phase 2 — Codify objects & fields, one domain at a time

Scaffold with `twenty dev:add object|field`, mirroring live metadata, aligned to
the module split. Sequence by cohesion and blast radius:

1. Product-usage / telemetry first (self-contained, high value).
2. Then sales, partner, GTM content, enrichment log.
3. Retire the legacy call-recording model and stray morph targets rather than
   migrating them.

### Phase 3 — Port workflows → logic functions + triggers

Domain-aligned with Phase 2. Start where rewrite ≈ 0 and prove the loop end to end:

1. Easy wins: field-fill and enrichment aggregation workflows (pure code + record ops).
2. Then webhook intakes and cron jobs.
3. Gated last: email and AI-agent steps (need an email capability and `defineAgent`).
4. Drop the deactivated legacy set outright.

### Phase 4 — Views, layouts & navigation

Bring each domain's views, page layouts, and nav items into the app definition
(as the Resend module already does), then retire the matching manual config.

## Risks

- **Adoption semantics** (Phase 0) gate the whole effort — resolve first.
- **Live data** sits in these objects; codifying must relabel ownership, never
  recreate and orphan.
- **Email & AI** steps have no app primitive yet — sequence around them or build
  the capability.
- **The lowercase twin** overlaps in purpose; decide merge vs deprecate early to
  avoid a third variant.
