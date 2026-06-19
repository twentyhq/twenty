---
name: xopure-reporting-dashboard-audit
description: Audit, plan, or update XO Pure Twenty dashboards and reporting against the authoritative compensation plan, current CRM object model, and native Twenty dashboard capabilities. Use when updating `XOPURE-REPORTING-DASHBOARD-AUDIT.md`, comparing dashboard ideas to the compensation plan, or deciding what can be built natively versus what needs new modeled data or custom widgets.
---

# XO Pure Reporting & Dashboard Audit

## Purpose

Keep XO Pure dashboard and reporting work aligned to three things:
- the authoritative compensation plan
- the actual XO Pure Twenty object model
- the dashboard mechanisms Twenty already ships locally

## When to use

Use this skill when the user asks to:
- audit XO Pure reporting or dashboard coverage
- compare a dashboard plan to the compensation plan
- update `packages/twenty-apps/internal/xopure-crm/docs/XOPURE-REPORTING-DASHBOARD-AUDIT.md`
- decide whether a metric can be built with native Twenty widgets
- map compensation-plan concepts onto current XO objects
- check whether payment, payout, sync, network, or rank reporting is fully surfaced

Do not use this skill for unrelated XO Pure sync implementation work.

## Source-of-truth order

Always resolve evidence in this order:

1. `memory://root/memory_summary.md`
2. `packages/twenty-apps/internal/xopure-crm/docs/XOPURE-REPORTING-DASHBOARD-AUDIT.md`
3. `/home/n4s5ti/Downloads/XO_Pure_Comp_Plan - Final.pdf`
4. XO Pure object, view, and navigation files in `packages/twenty-apps/internal/xopure-crm/src/`
5. Local Twenty dashboard tooling and official Twenty dashboard docs

Memory is context only. The PDF and current code win.

## Key references

### Canonical XO Pure docs

- `packages/twenty-apps/internal/xopure-crm/docs/XOPURE-REPORTING-DASHBOARD-AUDIT.md`
- `packages/twenty-apps/internal/xopure-crm/docs/XOPURE-CRM-SYNC-SPEC.md`
- `/home/n4s5ti/Downloads/XO_Pure_Comp_Plan - Final.pdf`

### XO Pure source-code anchors

- Objects:
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-ambassador.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-commission.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order-line.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-customer.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payment.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payout-batch.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-referral-relationship.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-sync-map.object.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-sync-cursor.object.ts`
- Views and navigation:
  - `packages/twenty-apps/internal/xopure-crm/src/views/**/*.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/navigation-menu-items/**/*.ts`
- Operational health:
  - `packages/twenty-apps/internal/xopure-crm/src/logic-functions/handlers/sync-health-handler.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/logic-functions/handlers/sync-reconciliation-handler.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/logic-functions/handlers/supabase-sync-webhook-handler.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/backfill/backfill-runner.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/constants/source-table-mapping.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/utils/map-supabase-record.ts`
- Dashboard meta layer:
  - `packages/twenty-apps/internal/xopure-crm/src/dashboards/blueprints/dashboard-blueprint.type.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/dashboards/blueprints/ambassador-command-center.blueprint.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/dashboards/blueprints/leads-and-customers.blueprint.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/dashboards/blueprints/apply-dashboard-blueprint.ts`
  - `packages/twenty-apps/internal/xopure-crm/src/dashboards/cli/apply-dashboard-blueprint.ts`

### Twenty dashboard mechanism anchors

- `packages/twenty-server/src/modules/dashboard/tools/create-complete-dashboard.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/add-dashboard-widget.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/get-dashboard.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/add-dashboard-tab.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/schemas/widget.schema.ts`
- `packages/twenty-front/src/modules/page-layout/widgets/graph/components/GraphWidget.tsx`

### External dashboard docs

- `https://docs.twenty.com/user-guide/dashboards/overview`
- `https://docs.twenty.com/user-guide/dashboards/capabilities/widgets`
- `https://docs.twenty.com/user-guide/dashboards/capabilities/chart-settings`

## Required workflow

1. Read `memory://root/memory_summary.md`.
2. Read the current canonical audit doc before changing it.
3. Re-extract the compensation PDF with layout preserved:
   - `pdftotext -layout "/home/n4s5ti/Downloads/XO_Pure_Comp_Plan - Final.pdf" -`
4. Inspect the current XO Pure model, at minimum:
   - `xopure-ambassador.object.ts`
   - `xopure-commission.object.ts`
   - `xopure-order.object.ts`
   - `xopure-order-line.object.ts`
   - `xopure-customer.object.ts`
   - `xopure-payment.object.ts`
   - `xopure-payout-batch.object.ts`
   - `xopure-referral-relationship.object.ts`
   - `xopure-sync-map.object.ts`
   - `xopure-sync-cursor.object.ts`
5. Inspect current surfacing:
   - `src/views/**/*.ts`
   - `src/navigation-menu-items/**/*.ts`
6. Inspect native dashboard mechanics, at minimum:
   - `packages/twenty-server/src/modules/dashboard/tools/create-complete-dashboard.tool.ts`
   - `packages/twenty-server/src/modules/dashboard/tools/add-dashboard-widget.tool.ts`
   - `packages/twenty-server/src/modules/dashboard/tools/get-dashboard.tool.ts`
   - `packages/twenty-server/src/modules/dashboard/tools/add-dashboard-tab.tool.ts`
   - `packages/twenty-server/src/modules/dashboard/tools/schemas/widget.schema.ts`
   - `https://docs.twenty.com/user-guide/dashboards/overview`
   - `https://docs.twenty.com/user-guide/dashboards/capabilities/widgets`
   - `https://docs.twenty.com/user-guide/dashboards/capabilities/chart-settings`
7. Only then update the audit, plan, or recommendation.

## Hard rules

- The compensation PDF and current code are source of truth.
- If Supabase is read directly, it must be server-side only.
- Prefer a dedicated read-only Postgres role over browser/API keys for polling.
- Prefer sanitized private `crm` views over raw `public` tables.
- The dashboard UI must read from Twenty objects only, never directly from Supabase.
- Preserve the `$50` vs `$10` payout-threshold conflict unless the business resolves it explicitly.
- Do not claim exact `PV`, `GV`, or `PCV` semantics for `personalVolumeCents`, `teamVolumeCents`, or related fields unless code proves the mapping.
- Use `sponsorAmbassadorExternalId` and `sponsoredAmbassadorExternalId`. Never use stale referral field names.
- Treat `held → payable → paid` as the canonical payout lifecycle, but call current `payable` support a proxy when only `payableAt` or `payableCommissionCents` are modeled.
- Prefer workspace-native dashboards first. XO Pure currently has no verified `definePageLayout(...)` or `defineFrontComponent(...)` path to copy.
- `RECORD_TABLE` widgets require dedicated views. Do not reuse record-index views blindly.
- The native `RECORD_TABLE` path is runtime-proven locally for XO Pure: dedicated view first, then widget bound by `viewId`.
- If the PDF path is missing or moved, stop and locate the authoritative replacement before planning compensation dashboards.

## Canonical coverage that must be addressed

Any end-to-end audit or plan must explicitly cover:
- units: `Retail`, `CV`, `PV`, `PCV`, `GV`
- Way 01: Customer Commission
- Way 02: Milestone Bonuses
- Way 03: Team Pay
- Way 04: Elite Status
- Way 05: Generation Pay
- payout lifecycle
- FTC-critical order classification
- compression and genealogy
- payments and refunds
- payout batches
- sync health / ops health

For the canonical doc, keep the end-to-end coverage matrix with these four columns:
- canonical requirement
- current modeled fields / objects
- native dashboard coverage
- gap / next dependency

## Current planning posture

Default first dashboard:
- `Ambassador Command Center`

Selected implementation path:
- use the native Twenty workspace dashboard builder only
- do not propose XO Pure app-packaged dashboards unless the user explicitly reopens that choice
- treat the native builder path as runtime-proven locally once the local Twenty workspace shows created dashboard records and widgets after sync
- prefer the repo-local blueprint layer when extending the native dashboard, because it keeps widget intent in object/field-name form instead of one-off runtime UUIDs
- prefer idempotent blueprint application for new tabs like `Overview`, `Commissions`, and `Network`, then use a full re-apply to normalize tab order
- the current local runtime proof now includes all five native tabs:
  - `Overview`
  - `Commissions`
  - `Network`
  - `Rank and Elite Progress`
  - `Ops and FTC Health`
- the current local runtime proof also includes a separate blueprint-created native dashboard: `Leads and Customers Dashboard`
- the current local runtime proof for that follow-on dashboard includes one tab, `Pipeline and Customers`, with native KPI, pie-chart, and `RECORD_TABLE` widgets

Default native tabs:
1. Overview
2. Commissions
3. Network
4. Rank and Elite Progress
5. Ops and FTC Health

Default follow-on dashboards:
- Leads and Customers
- Executive Sales
- Payment
- Payout

## Build-order rule

Keep one consistent build sequence:

1. If any of these objects are still hidden, surface them through views and navigation first:
   - `xopurePayment`
   - `xopurePayoutBatch`
   - `xopureSyncMap`
   - `xopureSyncCursor`
2. Validate or derive canonical compensation metrics:
   - `CV` / `PV` / `PCV` / `GV`
   - affiliate type
   - level unlocks
   - generation access
   - FTC order type
3. If Supabase polling is part of the plan, define the secure read layer first:
   - private `crm` schema
   - sanitized `crm.v_twenty_*` views
   - dedicated read-only role
   - polling by `updated_at`
   - ownership/supervisor context carried into Twenty
4. Create dashboard-specific views for `RECORD_TABLE` widgets.
5. Build native dashboard tabs.
6. Only then consider `FRONT_COMPONENT` for tree, gauge, or blended cross-object gaps.

## What to report as gaps

Call these out plainly when they remain unresolved:
- affiliate type not explicitly modeled
- level unlock state not explicitly modeled
- generation access not explicitly modeled
- `PCV` not explicitly modeled
- milestone bonus records not explicitly modeled
- fast-start-pool records not explicitly modeled
- explicit FTC order-type field missing
- compression event trail missing
- clawback ledger / negative-balance state missing
- payment or payout objects modeled but not surfaced
- secure read-only `crm` view layer missing
- read-only polling reader not implemented behind `readSourceBatch`

## Validation checklist

Before finishing:
- rerun `pdftotext -layout` if you cite compensation thresholds or tables
- search for stale referral field names in the doc
- confirm whether `xopurePayment`, `xopurePayoutBatch`, `xopureSyncMap`, and `xopureSyncCursor` are still hidden from views/navigation
- check that build order is consistent everywhere in the doc
- check that payout-lifecycle wording does not pretend `PAYABLE` is a current enum value if it is only proxied
- report `git status --short` for:
  - `.p0ly/skills/xopure-reporting-dashboard-audit/SKILL.md`
  - any canonical doc you changed alongside it

## Expected deliverable shapes

### If asked for an audit
Return:
- current reporting surfaces
- compensation-plan coverage matrix
- native dashboard fit
- gaps and dependencies
- recommended dashboard order

### If asked to update the canonical doc
Update:
- `packages/twenty-apps/internal/xopure-crm/docs/XOPURE-REPORTING-DASHBOARD-AUDIT.md`

Keep it:
- compensation-plan aligned
- evidence-backed
- explicit about unresolved ambiguity
- explicit about what is modeled vs inferred

### If asked to plan implementation
Default answer:
- surface hidden reporting objects first if they are not already visible in the workspace
- validate canonical metrics second
- define secure server-side Supabase read views/reader before any direct polling plan
- create native views and tabs after that
- defer custom widgets until native limits are proven
