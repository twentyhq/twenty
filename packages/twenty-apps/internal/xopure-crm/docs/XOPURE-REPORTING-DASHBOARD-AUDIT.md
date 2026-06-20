# XO Pure Reporting and Dashboard Audit

## Scope

This document consolidates two questions:

1. What reporting surfaces already exist inside the XO Pure Twenty app?
2. Which native Twenty dashboard/reporting capabilities can be used for XO Pure without inventing a parallel reporting system?

The goal is to make the current state, the gaps, and the recommended dashboard plan explicit in one place.

## Executive summary

XO Pure currently has reporting, but not dashboards.

- The app defines object table views only.
- The app does not currently define any dashboard page layouts or custom front components.
- Twenty itself has a native dashboard system with KPI, bar, line, pie, record-table, view, iframe, rich-text, and front-component widgets.
- Native Twenty dashboards are a strong fit for first-wave XO Pure operational reporting.
- The main gaps are cross-object blended reporting, gauge-style scorecards, and any reporting that depends on payment/payout data that is not yet surfaced in the XO Pure navigation/views.

## Authoritative compensation-plan constraints

The dashboard plan in this document is subordinate to the authoritative compensation-plan PDF:

- `/home/n4s5ti/Downloads/XO_Pure_Comp_Plan - Final.pdf`

The layout-preserving extraction of that PDF ends with:

> Authoritative source. Drives Policies & Procedures, public Comp Plan PDF, database `commission_config_versions`, and ambassador dashboards. All downstream documents must align to this file.

### Canonical units

The compensation plan defines the core reporting units as:
- `Retail`
- `CV` = commissionable volume
- `PV`
- `PCV`
- `GV`

All thresholds, rates, and bonus triggers are denominated in `CV` unless explicitly stated otherwise.

For dashboard design, this means XO Pure cannot treat gross sales, attributed revenue, and commissionable volume as interchangeable.

### Canonical compensation surfaces

The compensation plan requires dashboards to represent five distinct compensation surfaces:

1. Way 01 — Customer Commission (progressive tiers)
2. Way 02 — Milestone Bonuses
3. Way 03 — Team Pay
4. Way 04 — Elite Status
5. Way 05 — Generation Pay

These are not optional reporting enhancements. They are part of the canonical operating model.

### Canonical affiliate and rank model

The compensation plan defines three affiliate types:
- Customer / Referral Affiliate
- Ordering Affiliate
- Elite Pack Affiliate

It also defines:
- level-based team pay at `L1` through `L4`
- level unlock requirements based on personal enrollments
- rank codes `R0` through `R6`
- generation access tied to rank
- two rank-tracking fields per ambassador:
  - `paid_as_rank`
  - `career_rank`

For dashboard design, rank progress, unlock status, and affiliate type are first-class concepts.

### Canonical payout lifecycle

The compensation plan defines:
- weekly payout cadence
- Friday payout day
- `America/New_York` timezone
- 7-day hold window from payment date
- accrual status flow: `held → payable → paid`
- refund, hold, and clawback behavior

This means payout-state dashboards must reflect lifecycle transitions, not just final paid totals.

### Canonical FTC-critical order classification

The compensation plan treats order classification as compliance-critical. It explicitly distinguishes:
- self-order
- retail / guest checkout
- ambassador-to-ambassador purchase

For each order type, the plan specifies whether it counts toward:
- `PV`
- `PCV`
- `GV`
- personal-customer counts
- commission eligibility

This means order and compliance dashboards must surface order classification, not only revenue and commission totals.

### Canonical compression and genealogy rules

The compensation plan explicitly defines:
- level compression
- generation compression
- sponsor/downline lineage implications

This makes network visibility a core dashboard requirement, not just a nice-to-have genealogy view.

### Canonical ambiguity that must be preserved

The compensation plan contains one important internal inconsistency that affects dashboards:

- `Payout Schedule` lists `Minimum payout` as `$50`
- `Commission Calculation Flow` says Friday sweep pays totals `≥ $10`
- `Period-level caps` lists `Minimum payout threshold` as `$10`

The layout-preserving extraction resolves the rank table, elite maintenance values, and payout-cap table well enough to use them in planning. The remaining unresolved conflict is the minimum-payout threshold.

Until clarified, dashboards should not present one threshold as definitively correct without an explicit business decision.

## Secure read-only Supabase ingestion model

If XO Pure reads Supabase directly for sync or dashboard-supporting ingestion, the secure model is:

- Supabase is read **server-side only**
- the dashboard UI never queries Supabase directly
- the preferred reader uses a dedicated **read-only Postgres role**
- that role reads only from sanitized `crm` views, not raw `public` tables
- when the dedicated DSN is unavailable and Supabase must not be mutated, the
  server-side REST fallback can use a publishable/anon key for GET-only reads
  against exposed `public` tables
- the sync pipeline stamps ownership and scope into Twenty records
- dashboards then read from Twenty only, where row-level permissions enforce per-individual visibility

### No direct browser access

The browser should never hold:
- Supabase database credentials
- service-role keys
- privileged read-only role credentials

All Supabase reads must happen in server/worker code. Twenty remains the presentation layer.

### Preferred schema and view layer

The safest ingestion surface is a private `crm` schema containing sanitized views such as:

- `crm.v_twenty_profiles`
- `crm.v_twenty_customers`
- `crm.v_twenty_affiliates`
- `crm.v_twenty_products`
- `crm.v_twenty_orders`
- `crm.v_twenty_order_items`
- `crm.v_twenty_payments`
- `crm.v_twenty_commission_ledger`

Each view should expose only:
- stable external IDs
- lifecycle and reporting fields
- `updated_at`
- ownership and supervisor context needed to stamp Twenty-side row scope
- canonicalized dashboard-safe values where they are already known

Each view should explicitly avoid:
- auth/session secrets
- raw provider payloads
- payout account details
- fraud evidence unless required for a specific internal workflow
- unnecessary full-address or free-text PII

This minimizes bleed at the ingestion boundary.

### Read-only role shape

The preferred role is a dedicated Postgres login such as `readonly_crm_sync` with:

- `CONNECT`
- `USAGE` on schema `crm`
- `SELECT` on the `crm` views only
- no write privileges
- no replication privileges

It should also be denied broad access to raw application schemas.

This role should not be exposed through the browser or normal client-side Supabase usage.

Creating this role, granting privileges, or changing Supabase API schemas writes
to Supabase. Under a no-Supabase-write constraint, those actions are not
performed; the REST fallback reads only what the current public PostgREST API
already exposes. Existing `crm` views are not exposed through PostgREST unless
Supabase API schemas are changed.

### RLS and view security

Supabase/Postgres view security matters:

- views can bypass RLS by default if created as `security definer`
- Postgres 15+ supports `security_invoker = true` for views that should obey underlying RLS

For XO Pure's internal sync path, the safer default is:
- keep the `crm` schema unexposed to public API clients
- grant the dedicated sync role `SELECT` only on the sanitized views
- use RLS-aware `security_invoker` views only when the underlying row filtering is intentionally part of the ingestion design

### Polling over realtime/replication

For least privilege, prefer polling by `updated_at` over replication-based CDC.

Example pattern:

```sql
select *
from crm.v_twenty_orders
where updated_at > $1
order by updated_at asc, id asc
limit $2;
```

Reasons:
- works with a plain read-only role
- avoids replication privileges
- gives deterministic recovery and replay
- matches the existing cursor/backfill model in this repo

### Existing repo hook points

The repo already has the post-read pipeline:

- source table support:
  - `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/types/mapped-source-record.type.ts`
- source mappings:
  - `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/constants/source-table-mapping.ts`
- mapper:
  - `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/utils/map-supabase-record.ts`
- webhook upsert path:
  - `packages/twenty-apps/internal/xopure-crm/src/logic-functions/handlers/supabase-sync-webhook-handler.ts`
- backfill runner contract:
  - `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/backfill/backfill-runner.ts`

What is still missing is the live read-only reader implementation behind `readSourceBatch`.

### No-bleed scoping strategy

To avoid bleed between individual ambassadors/managers in the UI:

1. the Supabase read layer must expose ownership context
2. the mapper/upsert path must stamp that ownership into Twenty records
3. Twenty row-level permissions then enforce per-individual visibility

In practice, the ingestion surface should provide fields like:
- `assigned_ambassador_external_id`
- `supervisor_ambassador_external_id`
- any other source identifiers needed to resolve workspace-member ownership

The current Twenty-side row-scope model already expects explicit ownership fields:
- `packages/twenty-apps/internal/xopure-crm/src/roles/ambassador-row-permissions.ts`

That means the dashboard layer should never infer row scope ad hoc. Scope must be carried on the synced records themselves.

### Design rule for dashboard semantics

The dashboard blueprint layer must not invent business semantics.

Values such as:
- `CV`
- `PV`
- `PCV`
- `GV`
- affiliate type
- FTC order type
- generation access
- level unlock state

should be derived either:
- in the sanitized `crm` views, or
- in explicit server-side sync transforms

before they reach Twenty objects and dashboard widgets.

## Current XO Pure reporting inventory

### What exists now

The current app exposes reporting as object-specific table views under `packages/twenty-apps/internal/xopure-crm/src/views/`.

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/views/customer-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/order-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/commission-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/ambassador-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/influencer-prospecting-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/retail-prospecting-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/referral-relationship-downline.view.ts`

AST confirmation:
- `defineView({ ..., type: ViewType.TABLE, ... })` matches every XO Pure view file.
- No `definePageLayout(...)` matches under `packages/twenty-apps/internal/xopure-crm/src/**/*`.
- No `defineFrontComponent(...)` matches under `packages/twenty-apps/internal/xopure-crm/src/**/*`.

### What that means

The current XO Pure reporting model is:
- record-index table views
- filtered role-specific table slices
- object drill-down by opening records

The current XO Pure reporting model is not:
- dashboard cards
- charts
- executive scoreboards
- multi-widget operational pages
- custom reporting UI

## Current reporting surfaces by domain

### Customers

Primary view:
- `packages/twenty-apps/internal/xopure-crm/src/views/customer-operating-view.ts`

Currently surfaced fields:
- name
- status
- tags
- lifetime value
- order count

This is a useful operator table, but not a dashboard.

### Orders

Primary view:
- `packages/twenty-apps/internal/xopure-crm/src/views/order-operating-view.ts`

Currently surfaced fields:
- order number
- status

Modeled but not surfaced in the default view:
- order totals and cents fields
- shipping, tax, discount, refund
- payment status
- ordered/shipped/delivered timestamps
- ambassador attribution
- fulfillment status
- manual review flag
- tracking number and tracking URL

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order.object.ts`

The order object already contains enough fields to support meaningful dashboard reporting, but the default operator view exposes only a small subset.

### Order lines and product drill-down

Existing view coverage:
- `packages/twenty-apps/internal/xopure-crm/src/views/order-line-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/product-operating-view.ts`

Modeled item-level reporting fields:
- `quantity`
- `unitPriceCents`
- `lineTotalCents`
- `cvAmount`
- `category`

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order-line.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/navigation-menu-items/order-lines.navigation-menu-item.ts`

This is useful for later SKU-, category-, and item-level CV reporting, and it is already surfaced more completely than payment or payout objects.

### Commissions

Views:
- `packages/twenty-apps/internal/xopure-crm/src/views/commission-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/commission-review.view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/team-commissions-ambassador-manager.view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/my-commissions-ambassador-rep.view.ts`

Currently surfaced:
- name
- status
- role/ownership slices via assigned ambassador and supervisor fields

Modeled and available for dashboards:
- amount / amount cents
- rate
- paid at
- hold until
- payable at
- pay area
- period ID
- base CV amount
- last synced at

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-commission.object.ts`

### Ambassadors

Views:
- `packages/twenty-apps/internal/xopure-crm/src/views/ambassador-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/ambassador-roster-manager.view.ts`

Currently surfaced:
- name
- level
- status
- workspace member / manager workspace member in the roster view

Modeled and available for dashboards:
- commission rate
- personal volume cents
- team volume cents
- active customer count
- attributed revenue / attributed revenue cents
- earned / held / payable / paid / lifetime commission cents
- last commission at
- last synced at

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-ambassador.object.ts`

This object is already the strongest native dashboard candidate in the app.

### Leads and prospects

Views:
- `packages/twenty-apps/internal/xopure-crm/src/views/my-leads-ambassador-rep.view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/my-team-leads-ambassador-manager.view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/unassigned-triage-admin.view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/influencer-prospecting-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/retail-prospecting-view.ts`

These provide role-based pipeline slices, but still as tables only.

### Downline / referral reporting

View:
- `packages/twenty-apps/internal/xopure-crm/src/views/referral-relationship-downline.view.ts`

This already exposes a usable table for relationship depth and active status, but there is no summary dashboard on top of it.

### Payments

View:
- `packages/twenty-apps/internal/xopure-crm/src/views/payment-operating-view.ts`

Currently surfaced fields:
- name
- status
- provider
- rail
- amount cents
- refund cents
- last synced at

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payment.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/navigation-menu-items/payments.navigation-menu-item.ts`

This object is now visible in the workspace and is ready for follow-on payment-state dashboards once the compensation semantics around refunds and clawbacks are validated.

### Payout batches

View:
- `packages/twenty-apps/internal/xopure-crm/src/views/payout-batch-operating-view.ts`

Currently surfaced fields:
- name
- status
- total cents
- commission count
- submitted at
- completed at

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payout-batch.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/navigation-menu-items/payout-batches.navigation-menu-item.ts`

This object is now visible in the workspace and can support payout-batch monitoring once the actual payout reconciliation flow is confirmed.

### Sync and operational health

Logic functions:
- `packages/twenty-apps/internal/xopure-crm/src/logic-functions/sync-health.ts`
- `packages/twenty-apps/internal/xopure-crm/src/logic-functions/handlers/sync-health-handler.ts`
- `packages/twenty-apps/internal/xopure-crm/src/logic-functions/sync-reconciliation.ts`
- `packages/twenty-apps/internal/xopure-crm/src/logic-functions/handlers/sync-reconciliation-handler.ts`

Modeled sync objects:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-sync-map.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-sync-cursor.object.ts`

What exists today:
- function-based health output
- reconciliation logic
- technical objects that hold status, timestamps, and errors
- basic workspace surfacing for sync-map diagnostics
- basic workspace surfacing for sync-cursor status

What does not exist today:
- dashboard or operator page for sync health

## Current reporting gaps inside XO Pure

### Gap 1: no actual dashboards

There are no app-defined dashboards, dashboard page layouts, or front-component reporting widgets today.

### Gap 2: surfaced technical and financial objects are not yet curated into dashboards

The app now exposes payments, payout batches, sync maps, and sync cursors through basic table views and navigation, but they are still raw operator tables rather than curated dashboard experiences.

Currently surfaced but not yet dashboarded:
- `xopurePayment`
- `xopurePayoutBatch`
- `xopureSyncMap`
- `xopureSyncCursor`

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/views/payment-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/payout-batch-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/sync-map-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/views/sync-cursor-operating-view.ts`
- `packages/twenty-apps/internal/xopure-crm/src/navigation-menu-items/payments.navigation-menu-item.ts`
- `packages/twenty-apps/internal/xopure-crm/src/navigation-menu-items/payout-batches.navigation-menu-item.ts`
- `packages/twenty-apps/internal/xopure-crm/src/navigation-menu-items/sync-maps.navigation-menu-item.ts`
- `packages/twenty-apps/internal/xopure-crm/src/navigation-menu-items/sync-cursors.navigation-menu-item.ts`

Surfaced payment fields include:
- `provider`
- `rail`
- `methodCode`
- `amountCents`
- `currencyCode`
- `status`
- `providerPaymentId`
- `refundCents`
- `description`
- `lastSyncedAt`

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payment.object.ts`

Surfaced payout-batch fields include:
- `status`
- `totalCents`
- `currencyCode`
- `commissionCount`
- `submittedAt`
- `completedAt`
- `providerReference`
- `notes`

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payout-batch.object.ts`

This means payment, payout, and sync reporting are blocked less by workspace surfacing and more by missing dashboard composition plus unresolved compensation semantics.

### Gap 3: high-value metrics exist but are not promoted

The app already stores useful metrics on core objects, especially:
- ambassador performance fields
- commission timing and amount fields
- order money / payment / fulfillment / tracking fields
- sync status/error fields

Those fields are available for reporting, but the current UX leaves them buried inside object definitions or individual record pages.

### Gap 4: sync health is operationally important but not visible in the workspace UI

`sync-health-handler.ts` already computes:
- total sync-map count
- sync-map status buckets
- latest sync timestamp
- cursor statuses
- error summaries
- a top-level `healthy` / `degraded` / `unhealthy` classification

That is useful reporting logic today, but it is only exposed through logic-function output rather than a dashboard.

## Plan-to-current-data-model gaps

The current XO Pure object model partially supports the canonical compensation plan, but not completely.

### Concepts already represented directly

Evidence across current objects:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-ambassador.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-commission.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-referral-relationship.object.ts`

Already modeled:
- `careerRank`
- `paidAsRank`
- `personalVolumeCents`
- `teamVolumeCents`
- `activeCustomerCount`
- `heldCommissionCents`
- `payableCommissionCents`
- `paidCommissionCents`
- `lifetimeCommissionCents`
- `cvAmount`
- `baseCvAmount`
- sponsor and sponsored ambassador IDs
- relationship `depth`
- commission `holdUntil`
- commission `payableAt`

This is enough to build a meaningful first dashboard, but not enough to claim complete compensation-plan coverage.

### Concepts present but semantically unverified

The current model has fields that may correspond to the compensation plan, but the audit cannot yet prove exact equivalence:

- `xopureOrder.cvAmount`
- `xopureCommission.baseCvAmount`
- `xopureAmbassador.personalVolumeCents`
- `xopureAmbassador.teamVolumeCents`

Open semantic questions:
- does `personalVolumeCents` equal canonical `PV`, or something adjacent?
- does `teamVolumeCents` equal canonical `GV`, or only a partial aggregate?
- is `cvAmount` computed exactly per the compensation plan's `CV = 50% of retail` rule in every order path?

Until validated, dashboards should label these carefully and avoid overclaiming that existing fields are canonical `PV` / `GV` / `CV` without qualification.

### Missing or not-yet-explicit concepts

The current model does not visibly persist several canonical dashboard concepts:

- explicit `affiliateType`
- explicit level-unlock state (`L2`, `L3`, `L4`)
- explicit generation-access state
- explicit `PCV`
- explicit personal-enrollment count
- explicit milestone-bonus records
- explicit fast-start-pool records
- explicit compression events / audit trail
- explicit FTC order-type classification field aligned to the three canonical order types
- explicit clawback ledger / negative-balance state

Evidence:
- no current object reviewed in this audit exposes fields with those names or equivalent explicit labels

These concepts either need:
- new persisted fields
- derived snapshots
- or dashboard-side derived logic backed by validated data sources

### Current payout-state mismatch

The compensation plan's canonical status flow is:
- `held → payable → paid`

The current commission object persists:
- status options `PENDING`, `APPROVED`, `PAID`, `VOID`, `HELD`
- plus a `payableAt` timestamp

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-commission.object.ts`

So XO Pure already has partial payout-state support, but not a one-to-one status enum match with the canonical compensation lifecycle.

### Current FTC-order-classification mismatch

The compensation plan requires explicit reporting for:
- self-order
- retail / guest checkout
- ambassador-to-ambassador purchase

The current order object exposes:
- `buyerType`
- `commissionable`
- `cvAmount`
- `ambassadorExternalId`

Evidence:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order.object.ts`

That may be enough to derive some FTC views, but it is not yet an explicit canonical order-type model.

## End-to-end compensation dashboard coverage

Evidence used for this coverage matrix:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-ambassador.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-commission.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-order-line.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payment.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payout-batch.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-referral-relationship.object.ts`
- `packages/twenty-apps/internal/xopure-crm/src/logic-functions/handlers/sync-health-handler.ts`
- `packages/twenty-server/src/modules/dashboard/tools/create-complete-dashboard.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/add-dashboard-widget.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/get-dashboard.tool.ts`

| Canonical requirement | Current modeled fields / objects | Native dashboard coverage | Gap / next dependency |
| --- | --- | --- | --- |
| Units: `CV`, `PV`, `PCV`, `GV` | `xopureOrder.cvAmount`; `xopureOrderLine.cvAmount`; `xopureCommission.baseCvAmount`; `xopureAmbassador.personalVolumeCents`; `xopureAmbassador.teamVolumeCents` | KPI, line, bar, and record-table widgets can display these numeric fields once semantics are validated | `PCV` is not explicitly modeled; `personalVolumeCents` and `teamVolumeCents` may or may not equal canonical `PV` / `GV`; metric semantics need validation or derived snapshots |
| Way 01 — Customer Commission progressive tiers | `xopureCommission.amountCents`; `xopureCommission.rate`; `xopureCommission.payArea`; `xopureOrder.cvAmount` | Commissions tab can show customer-commission totals, rates, and trends if `payArea` or an equivalent discriminator is usable | No explicit monthly tier-band field, no explicit tier-reset state, and no proven mapping from `payArea` to Way 01 |
| Way 02 — Milestone Bonuses | `xopureAmbassador.teamVolumeCents`; possibly `xopureCommission.payArea` if bonus rows are stored there | Rank / Elite Progress tab can show progress toward GV thresholds; Commissions tab can show bonus rows if bonus commissions are persisted distinctly | No explicit milestone-bonus object or explicit Bronze/Silver/Gold payout records are visible in the current model |
| Way 03 — Team Pay | `xopureCommission.amountCents`; `xopureCommission.rate`; `xopureCommission.baseCvAmount`; `xopureReferralRelationship.depth`; `xopureAmbassador.paidAsRank` | Commissions + Network tabs can visualize commission totals, sponsor relationships, and depth-based analysis | No explicit `affiliateType`; no explicit L1/L2/L3/L4 unlock-state fields; no explicit compression-event audit trail |
| Way 04 — Elite Status | `xopureAmbassador.careerRank`; `xopureAmbassador.paidAsRank`; `xopureAmbassador.activeCustomerCount`; `xopureAmbassador.personalVolumeCents`; `xopureAmbassador.teamVolumeCents` | Rank / Elite Progress tab can show current rank mix, performance proxies, and commission balances | No explicit elite qualification window, no explicit elite-pack-purchase flag, and no explicit maintenance snapshot proving monthly compliance |
| Way 05 — Generation Pay | `xopureAmbassador.paidAsRank`; `xopureReferralRelationship.depth`; `xopureCommission.rate`; `xopureCommission.baseCvAmount`; `xopureCommission.payArea` | Network + Commissions tabs can show depth, lineage, and generation-like commission slices if fields are semantically mapped | No explicit generation-access field, no explicit generation-bonus records, and no explicit generation-compression events |
| Payout lifecycle: `held → payable → paid` | `xopureCommission.status`; `xopureCommission.holdUntil`; `xopureCommission.payableAt`; `xopureCommission.paidAt`; `xopureAmbassador.heldCommissionCents`; `xopureAmbassador.payableCommissionCents`; `xopureAmbassador.paidCommissionCents`; `xopurePayoutBatch.status` | Commissions tab can show held balances directly and payable/paid state through `payableAt`, `payableCommissionCents`, and payout-batch timing proxies; payout-batch widgets can be added once surfaced | Current status enum is `PENDING` / `APPROVED` / `PAID` / `VOID` / `HELD`, so `PAYABLE` is only proxied today; minimum payout threshold is internally inconsistent in the PDF |
| FTC-critical order classification | `xopureOrder.buyerType`; `xopureOrder.commissionable`; `xopureOrder.cvAmount`; `xopureOrder.ambassadorExternalId` | Ops and FTC Health tab can show exception tables and filtered order slices | No explicit canonical order-type field for self-order vs retail/guest vs ambassador-to-ambassador; `PCV` is not persisted explicitly |
| Compression and genealogy | `xopureReferralRelationship.sponsorAmbassadorExternalId`; `xopureReferralRelationship.sponsoredAmbassadorExternalId`; `xopureReferralRelationship.depth`; `xopureReferralRelationship.isActive` | Network tab can show direct referrals, depth distribution, and sponsor/downline tables | No explicit level-compression or generation-compression event log; tree/map likely needs later custom visualization |
| Payments and refunds | `xopurePayment.provider`; `xopurePayment.rail`; `xopurePayment.methodCode`; `xopurePayment.amountCents`; `xopurePayment.status`; `xopurePayment.refundCents`; `xopureOrder.paymentStatus`; `xopureOrder.refundCents` | Follow-on Payment dashboard can show payment-state and refund reporting once views/navigation are added | Payment object exists but is not surfaced in views/navigation; no explicit clawback linkage from refunded payments to commissions is visible |
| Payout batches | `xopurePayoutBatch.status`; `xopurePayoutBatch.totalCents`; `xopurePayoutBatch.commissionCount`; `xopurePayoutBatch.submittedAt`; `xopurePayoutBatch.completedAt`; `xopurePayoutBatch.providerReference` | Follow-on Payout dashboard can show batch volume, failure rate, and completion time once surfaced | Payout-batch object exists but is not surfaced in views/navigation; audit has not proven active population or payout reconciliation flow |
| Sync health and ops | `xopureSyncMap.lastStatus`; `xopureSyncMap.lastSyncedAt`; `xopureSyncMap.lastErrorSummary`; `xopureSyncCursor.step`; `xopureSyncCursor.lastRunStatus`; `xopureSyncCursor.lastRunAt`; `sync-health-handler.ts` computed health report | Ops and FTC Health tab can cover sync status counts, stale cursor tables, and error tables using native widgets plus rich-text policy notes | Sync objects are still hidden from views/navigation and there is no persisted “health” record; health status is computed at request time |

## What native Twenty dashboards can do

### Native dashboard object exists

Evidence:
- `packages/twenty-server/src/modules/dashboard/standard-objects/dashboard.workspace-entity.ts`

Dashboard fields include:
- `title`
- `pageLayoutId`
- `position`

### Dashboards are page layouts of type `DASHBOARD`

Evidence:
- `packages/twenty-server/src/engine/metadata-modules/page-layout/enums/page-layout-type.enum.ts`

### Native widget types are broad enough for XO Pure phase 1

Evidence:
- `packages/twenty-server/src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum.ts`

Relevant native widget types:
- `GRAPH`
- `RECORD_TABLE`
- `VIEW`
- `IFRAME`
- `STANDALONE_RICH_TEXT`
- `FRONT_COMPONENT`

This is enough to build a first operational dashboard pack without inventing a reporting subsystem.

### Native chart types are viable now

Evidence:
- `packages/twenty-front/src/modules/page-layout/widgets/graph/components/GraphWidget.tsx`

Front-end renderers exist for:
- aggregate KPI charts
- pie charts
- bar charts
- line charts

Server-side chart data resolvers exist for:
- bar chart data
- line chart data
- pie chart data

### Important native limits

#### Gauge charts are not usable now

Evidence:
- gauge config DTO exists server-side
- `GraphWidget.tsx` renders `WidgetConfigurationType.GAUGE_CHART` as invalid config

XO Pure should not plan on gauge widgets in the first pass.

#### Chart queries are scoped to one object at a time

Evidence:
- `packages/twenty-server/src/modules/dashboard/chart-data/dtos/inputs/bar-chart-data.input.ts`
- equivalent line and pie inputs follow the same pattern

Those inputs require a single `objectMetadataId`.

That means native dashboards are strongest when the metric can be answered from one object at a time, for example:
- orders by status
- commissions by status
- ambassadors by level
- sync maps by last status

They are weaker for blended metrics that would require joins across multiple objects.

#### Record-table widgets depend on dedicated views

Evidence:
- `packages/twenty-server/src/modules/dashboard/tools/create-complete-dashboard.tool.ts`

For XO Pure this means dashboard tables should use dashboard-specific views rather than reusing every operator index view blindly.

### Public-docs lag caveat

Public Twenty docs still describe dashboards as beta and say tables and gauges are not available:
- `https://docs.twenty.com/user-guide/dashboards/overview`

Local code is ahead of those docs in at least one important way:
- the local codebase has `RECORD_TABLE` widget support in server/frontend code and tool schemas
- gauge charts still remain effectively unavailable because `GraphWidget.tsx` treats them as invalid config

For XO Pure this means:
- treat `RECORD_TABLE` as a viable local implementation path
- verify it in a running workspace before relying on it operationally
- do not plan around gauge widgets

## Local dashboard templates and reference implementations

### Generic starter template

Evidence:
- `packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-dashboard-page-layout.config.ts`

This file defines a generic dashboard called `My First Dashboard` with:
- dashboard page-layout type
- a grid tab
- rich-text, chart, iframe, and KPI-style starter widgets

This is the clearest local example that Twenty expects dashboards to be assembled as page layouts with tabs and widgets.

### Seeded example dashboards with real layouts

Evidence:
- `packages/twenty-server/src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds.util.ts`
- `packages/twenty-server/src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds-v2.util.ts`

These are the best local dashboard templates because they include:
- real widget titles
- real chart types
- real object/field bindings
- real `gridPosition` / `position` values in the 12-column layout
- concrete examples for Sales, Customer, and Team-style dashboards

Examples visible in the seeds:
- `Revenue Forecast`
- `New Customers Over Time`
- `Revenue Distribution`
- `Contact Roles`

These seed files are the strongest local source for copying dashboard composition and widget sizing patterns into XO Pure.

### Dashboard builder recipe and grid rules

Evidence:
- `packages/twenty-server/src/modules/dashboard/tools/create-complete-dashboard.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/schemas/widget.schema.ts`

These files document the local dashboard recipe:
- dashboard = page layout + tab + widgets
- grid is 12 columns wide
- KPI widgets typically use shorter spans
- charts typically use larger row spans
- `GRAPH`, `VIEW`, `IFRAME`, `STANDALONE_RICH_TEXT`, and `RECORD_TABLE` are valid tool-level widget types
- `RECORD_TABLE` widgets require a dedicated table view created first

### Multi-tab support exists

Evidence:
- `packages/twenty-server/src/modules/dashboard/tools/add-dashboard-tab.tool.ts`

This confirms XO Pure should think in dashboard tabs, not only in one long dashboard canvas.

### Iterative native-dashboard tooling exists

Evidence:
- `packages/twenty-server/src/modules/dashboard/tools/get-dashboard.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/add-dashboard-widget.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/create-complete-dashboard.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/schemas/widget.schema.ts`

These files are useful for implementation planning because they show that Twenty already supports an iterative dashboard workflow:
- create a dashboard
- inspect its full layout and widget config
- add tabs
- add widgets incrementally
- use field-aware configuration for chart widgets

This is another reason XO Pure should start with workspace-native dashboards instead of inventing app-packaged dashboard code first.

### Native builder path is now runtime-verified locally

Local runtime verification completed against a live Twenty workspace on `http://localhost:2020`:
- the XO Pure app was synced with `twenty -r local dev --once`
- surfaced objects were visible in the workspace shell
- a native dashboard record named `Ambassador Command Center` was created
- an `Overview` tab was created and ordered first
- a `Network` tab was created and ordered after `Commissions`
- a `Rank and Elite Progress` tab was then created and ordered before `Ops and FTC Health`
- an `Ops and FTC Health` tab was created on its backing page layout
- a `Commissions` tab was then added natively to the same dashboard
- native widgets were created successfully on that tab:
  - `Total Sync Records`
  - `Sync Status Mix`
  - `Cursor Runs Over Time`
  - `Total Commissions`
  - `Commission Amount`
  - `Held Balance`
  - `Payable Balance`
  - `Commission Status Mix`
  - `Commission Ledger` as a native `RECORD_TABLE` widget backed by a dedicated view
  - `Total Relationships`
  - `Active Relationships`
  - `Max Downline Depth`
  - `Relationship Depth Mix`
  - `Referral Network Ledger` as a native `RECORD_TABLE` widget backed by a dedicated view
  - `Personal Volume`
  - `Team Volume Progress`
  - `Active Customers Progress`
  - `Career Rank Mix`
  - `Rank Progress Ledger` as a native `RECORD_TABLE` widget backed by a dedicated view

This means the native-builder path is no longer only a design preference. It is proven locally end-to-end for XO Pure.

## Repo-local dashboard meta layer

The repo now includes a thin dashboard blueprint layer to help build native Twenty dashboards in the same broad shape as the local example seeds, but without hard-coding runtime UUIDs.

Blueprint files:
- `packages/twenty-apps/internal/xopure-crm/src/dashboards/blueprints/dashboard-blueprint.type.ts`
- `packages/twenty-apps/internal/xopure-crm/src/dashboards/blueprints/ambassador-command-center.blueprint.ts`
- `packages/twenty-apps/internal/xopure-crm/src/dashboards/blueprints/leads-and-customers.blueprint.ts`
- `packages/twenty-apps/internal/xopure-crm/src/dashboards/blueprints/apply-dashboard-blueprint.ts`
- `packages/twenty-apps/internal/xopure-crm/src/dashboards/cli/apply-dashboard-blueprint.ts`

What it does:
- mirrors native widget layout ideas from the seeded examples
- describes tabs and widgets by `objectNameSingular` and `fieldName`
- resolves metadata UUIDs at apply time
- can target an existing dashboard by `dashboardId` or create a new native dashboard shell from the blueprint title
- creates only missing native tabs, views, view fields, and widgets
- updates tab positions when the blueprint order changes

What it does not do:
- define app-packaged dashboards inside XO Pure
- replace the native builder
- invent compensation semantics that the current model does not prove

Local runtime proof:
- the `Overview` tab was created via the blueprint applier
- the `Network` tab was then created via the same blueprint applier
- the `Rank and Elite Progress` tab was then created via the same blueprint applier
- the full blueprint re-ran idempotently and only updated the `Ops and FTC Health` tab position
- the resulting tab now renders:
  - `Total Ambassadors`
  - `Active Customer Count`
  - `Team Volume`
  - `Attributed Revenue`
  - `Ambassador Status Mix`
  - `Paid-as Rank Mix`
- the `Network` tab now renders:
  - `Total Relationships`
  - `Active Relationships`
  - `Max Downline Depth`
  - `Relationship Depth Mix`
  - `Referral Network Ledger`
- the `Rank and Elite Progress` tab now renders:
  - `Personal Volume`
  - `Team Volume Progress`
  - `Active Customers Progress`
  - `Career Rank Mix`
  - `Rank Progress Ledger`
- a separate native follow-on dashboard, `Leads and Customers Dashboard`, was then created from a second blueprint and re-applied idempotently
- its first tab, `Pipeline and Customers`, now contains:
  - `Retail Prospects`
  - `Influencer Prospects`
  - `Customers`
  - `Customer Lifetime Value`
  - `Retail Prospect Stage Mix`
  - `Influencer Prospect Stage Mix`
  - `Customer Status Mix`
  - `Retail Prospect Triage`
  - `Customer Snapshot`

## Online Twenty dashboard references

Official Twenty documentation is useful for product-level behavior and screenshots, but not for XO-Pure-specific templates.

Evidence:
- `https://docs.twenty.com/user-guide/dashboards/overview`
- `https://docs.twenty.com/user-guide/dashboards/capabilities/widgets`
- `https://docs.twenty.com/user-guide/dashboards/capabilities/chart-settings`

What the public docs are good for:
- confirming dashboard concepts
- confirming tabs and widget types exposed to users
- confirming chart behavior and display limits
- confirming end-user filter, date-granularity, and sort behavior
- giving screenshots and UI expectations

What the public docs do not provide:
- downloadable XO Pure dashboard templates
- ambassador-specific reporting designs
- proof that app-packaged dashboards are already wired for XO Pure

## Ambassador dashboard patterns from external systems

### PartnerStack pattern

Evidence:
- `https://support.partnerstack.com/hc/en-us/articles/360016866594-Comprehensive-overview-of-the-partner-dashboard`

Common surfaces:
- home/summary overview
- commissions
- reporting
- performance
- links
- customers / referrals
- resources
- messages

This is a strong reference for ambassador-facing program overview and commission visibility.

### impact.com pattern

Evidence:
- `https://help.impact.com/partner/what-would-you-like-to-learn-about/platform-features/dashboard/partner-dashboard-and-widgets-explained`

Common surfaces:
- snapshot metrics
- finance widget
- to-do list / tasks
- quick link creation
- lead submission

This is a strong reference for combining performance reporting with operator actions.

### UpPromote analytics pattern

Evidence:
- `https://docs.uppromote.com/management/analytics`

Common surfaces:
- performance overview
- performance insights such as CR, AOV, CPC, ROI, CAC
- commission breakdown
- referrals by tracking type
- top affiliates
- top products

This is a strong reference for summary KPI cards plus ranked affiliate/product tables.

### GoAffPro network pattern

Evidence:
- `https://docs.goaffpro.com/goaffpro/affiliate-dashboard/advanced-tabs/network`

Common MLM/downline surfaces:
- signup / invite link
- network summary
- network commissions by level
- direct referrals
- network explorer
- network map
- members by level

This is the strongest reference for XO Pure's ambassador downline and sponsor-tree reporting.

### Shared pattern across ambassador systems

Across those systems, the most consistent ambassador dashboard elements are:
- summary KPIs
- commission / payout status
- performance trends
- top affiliates / ambassadors
- referrals or customer tables
- quick-access links and tasks
- resources or messages
- a dedicated network/downline area when MLM-style structure exists

## Best-fit XO Pure dashboard plan

The right first move is to use native Twenty dashboards for XO Pure and treat custom widgets as exceptions, not the default.

The recommended first dashboard is not a generic executive sales page. It is a workspace-native ambassador operations dashboard shaped by the authoritative compensation plan and the way ambassador systems are normally consumed.

### First dashboard: Ambassador Command Center

Implementation mode:
- workspace-native dashboard first
- not app-packaged dashboard-as-code yet

Reason:
- local Twenty code clearly supports native dashboards
- local Twenty runtime has now proven native dashboard creation for XO Pure end-to-end
- XO Pure currently has no verified `definePageLayout(...)` or `defineFrontComponent(...)` path to copy
- the highest-value XO Pure workflow is ambassador operations, not generic CRM sales reporting
- the authoritative compensation plan says ambassador dashboards must align to compensation, rank, payout, network, and FTC-critical order logic

#### Tab 1: Overview

Purpose:
- give admins and managers an at-a-glance ambassador performance summary anchored in canonical compensation units and ranks

Primary objects:
- `xopureAmbassador`
- optionally `xopureOrder` for CV-derived summaries once semantics are validated

Recommended widgets:
- aggregate KPI: total ambassadors
- aggregate KPI: active ambassadors
- aggregate KPI: total lifetime commission cents
- aggregate KPI: total payable commission cents
- bar chart: ambassadors by `level`
- bar chart: ambassadors by `status`
- bar chart: ambassadors by `careerRank`
- bar chart: ambassadors by `paidAsRank`
- record table: top ambassadors by `teamVolumeCents`
- record table: top ambassadors by `personalVolumeCents`
- record table: top ambassadors by `attributedRevenueCents`

Key source fields:
- `xopureAmbassador.level`
- `xopureAmbassador.status`
- `xopureAmbassador.careerRank`
- `xopureAmbassador.paidAsRank`
- `xopureAmbassador.personalVolumeCents`
- `xopureAmbassador.teamVolumeCents`
- `xopureAmbassador.activeCustomerCount`
- `xopureAmbassador.attributedRevenueCents`
- `xopureAmbassador.lifetimeCommissionCents`
- `xopureAmbassador.payableCommissionCents`

#### Tab 2: Commissions

Purpose:
- give finance and ops a payout-readiness view aligned to Ways 01, 02, and 03

Primary objects:
- `xopureCommission`
- optionally later `xopurePayoutBatch`

Recommended widgets:
- aggregate KPI: total commissions
- aggregate KPI: total held commission cents
- aggregate KPI: total payable commission cents
- aggregate KPI: total paid commission cents
- pie chart: commissions by `status`
- line chart: commissions paid over time by `paidAt`
- line chart: commissions becoming payable over time by `payableAt`
- record table: held commissions with `holdUntil`
- record table: highest-value unpaid commissions
- rich-text panel: document the current minimum-payout ambiguity (`$50` vs `$10`) until clarified

Key source fields:
- `xopureCommission.status`
- `xopureCommission.amountCents`
- `xopureCommission.paidAt`
- `xopureCommission.payableAt`
- `xopureCommission.holdUntil`
- `xopureCommission.baseCvAmount`
- `xopureAmbassador.heldCommissionCents`
- `xopureAmbassador.payableCommissionCents`
- `xopureAmbassador.paidCommissionCents`

#### Tab 3: Network

Purpose:
- expose XO Pure's sponsor/downline model, compression implications, and lineage in a way that matches MLM-oriented ambassador systems

Primary objects:
- `xopureReferralRelationship`
- `xopureAmbassador`

Recommended widgets:
- aggregate KPI: direct referral count
- aggregate KPI: active network relationship count
- bar chart: referrals by `depth`
- record table: sponsor/downline relationships
- record table: direct referrals
- record table: ambassador roster by manager

Key source fields:
- `xopureReferralRelationship.depth`
- `xopureReferralRelationship.isActive`
- `xopureReferralRelationship.sponsorAmbassadorExternalId`
- `xopureReferralRelationship.sponsoredAmbassadorExternalId`
- `xopureReferralRelationship.lastSyncedAt`

Native widgets can cover the tabular and aggregate part of this tab. If XO Pure later needs a true tree or map, that likely becomes a custom `FRONT_COMPONENT`.

#### Tab 4: Rank and Elite Progress

Purpose:
- show progress toward rank, elite qualification, and generation access using the compensation plan as the canonical frame

Primary objects:
- `xopureAmbassador`
- `xopureCommission`
- `xopureOrder`

Recommended widgets:
- aggregate KPI: active customer count
- aggregate KPI: total personal-volume proxy
- aggregate KPI: total team-volume proxy
- bar chart: ambassadors by `paidAsRank`
- bar chart: ambassadors by `careerRank`
- record table: ambassadors nearing next-rank thresholds
- record table: ambassadors with held / payable / paid balances
- rich-text panel: document which canonical rank inputs are already modeled and which still need derived snapshots

Key source fields already present:
- `xopureAmbassador.paidAsRank`
- `xopureAmbassador.careerRank`
- `xopureAmbassador.personalVolumeCents`
- `xopureAmbassador.teamVolumeCents`
- `xopureAmbassador.activeCustomerCount`
- `xopureCommission.baseCvAmount`
- `xopureOrder.cvAmount`

Canonical inputs still missing or unverified for this tab:
- affiliate type
- personal-enrollment count
- explicit generation-access state
- explicit `PCV`
- explicit elite-window state
- exact semantic equivalence between current volume fields and canonical `PV` / `GV`

#### Tab 5: Ops and FTC Health

Purpose:
- make sync lag, payout-lifecycle exceptions, and FTC-critical order classification visible inside the workspace

Primary objects:
- `xopureSyncMap`
- `xopureSyncCursor`
- `xopureOrder`
- `xopureCommission`

Recommended widgets:
- aggregate KPI: total sync-map records
- pie chart: sync maps by `lastStatus`
- record table: sync-map records with non-null `lastErrorSummary`
- record table: oldest `lastSyncedAt` records
- record table: cursor rows by `step`, `lastRunStatus`, `lastRunAt`
- record table: orders needing manual review
- record table: commissions currently on hold
- rich-text panel: explain healthy / degraded / unhealthy thresholds from `sync-health-handler.ts`
- rich-text panel: explain the canonical FTC order matrix and note that explicit order-type persistence is not yet visible in the current object model

This tab is the most important operational addition because XO Pure already computes sync-health data but does not surface it in the workspace.

### Follow-on dashboards

#### Leads and Customers Dashboard

This follow-on dashboard is now runtime-proven locally as a separate native dashboard created from the repo-local blueprint layer.

Primary objects:
- `person`
- `retailProspect`
- `influencerProspect`
- `xopureCustomer`
- `xopureOrder`

Recommended widgets:
- aggregate KPI: team lead count
- aggregate KPI: active customer count
- bar chart: retail prospects by stage
- bar chart: influencer prospects by stage
- bar chart: orders by `status`
- record table: unassigned leads needing triage
- record table: recent customers with high LTV
- record table: orders needing manual review

Conservative locally-proven first slice:
- `Retail Prospects`
- `Influencer Prospects`
- `Customers`
- `Customer Lifetime Value`
- `Retail Prospect Stage Mix`
- `Influencer Prospect Stage Mix`
- `Customer Status Mix`
- `Retail Prospect Triage`
- `Customer Snapshot`

Deferred in the current local slice:
- order-driven widgets
- team-lead / assignment semantics requiring person-owner or supervisor validation

#### Executive Sales Dashboard

Use as a follow-on once the Ambassador Command Center exists.

Primary objects:
- `xopureOrder`
- `xopureCustomer`

Recommended widgets:
- aggregate KPI: total order count
- aggregate KPI: total order value or total cents
- aggregate KPI: refunded cents
- bar chart: orders by `status`
- bar chart: orders by `fulfillmentStatus`
- line chart: orders over time by `orderedAt`
- line chart: shipped orders over time by `shippedAt`
- aggregate KPI: customer count
- aggregate KPI: total customer lifetime value
- record table: recent refunded / cancelled orders

#### Payment Dashboard

Use once payment sync is fully populated and exposed.

Primary object:
- `xopurePayment`

Recommended widgets:
- payments by `status`
- payments by `provider`
- succeeded vs refunded payment totals
- payment exception tables

Evidence object exists:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payment.object.ts`

#### Payout Dashboard

Use once payout batches are actively managed in the workspace.

Primary object:
- `xopurePayoutBatch`

Recommended widgets:
- payout batches by `status`
- total payout cents
- payout batch completion time trend
- failed payout batch exceptions

Evidence object exists:
- `packages/twenty-apps/internal/xopure-crm/src/objects/xopure-payout-batch.object.ts`

## Workspace-native build order

The cleanest implementation path is workspace-native first, using the existing dashboard toolchain and dedicated dashboard views.

### Step 1: surface hidden reporting objects

This step is now complete in the current repo state:
- `xopureSyncMap`
- `xopureSyncCursor`
- `xopurePayment`
- `xopurePayoutBatch`

These objects now have basic table views and navigation coverage, which removes the blind spot for Ops, Payment, and Payout reporting and makes the underlying records inspectable before they are charted.

### Step 2: validate or derive canonical compensation metrics

Before labeling widgets with canonical plan language, validate or derive:
- whether `personalVolumeCents` is canonical `PV`
- whether `teamVolumeCents` is canonical `GV`
- how `PCV` will be persisted or derived
- how affiliate type is persisted
- how L2/L3/L4 unlock state is persisted
- how generation access is persisted
- how canonical FTC order type is persisted
- which minimum payout threshold is authoritative (`$50` vs `$10`)

If the current model does not persist these directly, create derived snapshots or explicit fields before promising canonical compensation dashboards.

### Step 3: create dashboard-specific table views

For any `RECORD_TABLE` widget, follow the native pattern documented in:
- `packages/twenty-server/src/modules/dashboard/tools/create-complete-dashboard.tool.ts`

That means:
- create a dedicated table view for the widget
- add the needed visible fields to that view
- then bind the `RECORD_TABLE` widget to that dedicated `viewId`

Do not reuse record-index views blindly.

This path is now runtime-proven locally for XO Pure through:
- workspace view `Commission Dashboard Table`
- dashboard widget `Commission Ledger`

### Step 4: build the Ambassador Command Center natively

Use the native dashboard workflow documented in:
- `packages/twenty-server/src/modules/dashboard/tools/create-complete-dashboard.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/add-dashboard-widget.tool.ts`
- `packages/twenty-server/src/modules/dashboard/tools/get-dashboard.tool.ts`

Recommended sequence:
1. create the dashboard shell
2. create tabs
3. add KPI and chart widgets
4. add record-table widgets once dedicated views exist
5. inspect layout and resolved field bindings with `get-dashboard.tool.ts`
6. adjust grid positions iteratively

### Step 5: only then consider custom front components

Use `FRONT_COMPONENT` widgets only after the native dashboard pass proves insufficient for:
- genealogy tree / network map
- blended cross-object executive metrics
- custom compensation explainers or what-if views

This keeps the first implementation boring, supportable, and close to Twenty's native path.

## Where native Twenty is a strong fit

Native Twenty dashboards are a strong fit for XO Pure when the question can be answered from one object at a time.

Examples:
- How many active ambassadors do we have?
- What is the commission status mix?
- How many orders are refunded vs fulfilled?
- Which sync records are failing?
- Which leads are unassigned?

Native dashboards are also a good fit for role-oriented dashboard composition, where a manager sees several widgets from different objects on one page.

## Where native Twenty is a weak fit

Native Twenty is a weaker fit when XO Pure needs:
- true cross-object executive metrics built from joins
- gauge-style scorecards
- complex computed health states that are not materialized in records
- custom visuals or interactions beyond standard widget behavior

If XO Pure needs those later, `FRONT_COMPONENT` widgets are the escape hatch. They should be used only after the native dashboard pass has proven insufficient.

## Recommended implementation order

### Phase 1

Use the newly surfaced sync, payment, and payout objects as the reporting base, then validate canonical compensation semantics:
1. validate or derive canonical `CV` / `PV` / `GV` semantics
2. decide authoritative minimum payout threshold (`$50` vs `$10`)
3. add explicit fields or derived snapshots for affiliate type, level unlocks, generation access, and FTC order type if they are not already persisted elsewhere

### Phase 2

Create dashboard-specific views and build the native workspace `Ambassador Command Center`:
1. Overview
2. Commissions
3. Network
4. Rank and Elite Progress
5. Ops and FTC Health

### Phase 3

Launch follow-on dashboards after the Ambassador Command Center is stable:
- Leads and Customers
- Executive Sales
- Payment
- Payout

### Phase 4

Only if native dashboards prove insufficient, add custom `FRONT_COMPONENT` widgets for:
- compression or genealogy maps
- richer payout/payment visuals
- FTC or compensation-policy explainers that need bespoke interactivity
- custom sync-health state cards

## Important caveat

This audit confirms that Twenty has a native dashboard system and that XO Pure does not currently define dashboards/page layouts/front-components.

Implementation decision:
- use the native Twenty workspace dashboard builder only
- do not build XO Pure app-packaged dashboards unless this decision is explicitly revisited

Reason:
- native dashboard tooling is already proven locally
- XO Pure app-packaged dashboard-as-code is still unproven in this repo
- the native builder is enough for the first `Ambassador Command Center` pass

## Final recommendation

Use native Twenty dashboards for XO Pure.

Do not start with custom reporting code.

The best immediate move is:
- keep the existing operator table views
- use the surfaced sync/payment/payout objects as the dashboard data base
- validate canonical compensation semantics before labeling widgets with plan terms
- add native dashboards on top of the already modeled XO Pure objects
- reserve custom front components for the small set of reporting needs native widgets cannot cover
