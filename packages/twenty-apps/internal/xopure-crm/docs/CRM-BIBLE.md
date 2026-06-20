# CRM.xopure.com — The Bible

**Last updated**: 2026-06-20
**Maintained by**: NS (n4s5ti)
**Status**: Sync pipeline live. Ops Command Center live. Bulk sync in progress.

---

## Mission

> Supabase is the source of truth.
> CRM is the **read-only** command center.
> The CRM does not change Supabase. It explains Supabase.

---

## Task Tracker

### Sync Pipeline

- [x] **Read-only Supabase source reader** (Postgres DSN via `xo_readonly`) — `NS`
- [x] **REST fallback reader** (publishable/anon key, GET only, cannot bypass RLS) — `NS`
- [x] **Any-env source selector** (prefers DSN, falls back to REST) — `NS`
- [x] **Row-to-Twenty mapper** (8 source tables to 10 target objects) — `NS`
- [x] **Idempotent upsert path** (sync map + content hash check) — `NS`
- [x] **CLI runner** (`yarn sync:backfill [--live] [--source-table=X]`) — `NS`
- [x] **Reusable Twenty REST client** (`twenty-rest-client.ts`) — `NS`
- [x] **Scheduled reconciliation worker** (runs real backfill on schedule) — `NS`
- [x] **Webhook handler with orders to payments fanout** — `NS`
- [ ] **Deploy app to Twenty production** (currently installed; redeploy after code changes) — `blocked: prod Railway deploy forbidden by AGENTS.md`
- [ ] **Wire scheduled worker cron** (env var on Railway worker) — `blocked: prod Railway env change forbidden by AGENTS.md`
- [ ] **Configure Supabase webhooks** (requires Supabase config write, blocked by no-write rule) — `blocked: Supabase writes/config not allowed`
- [ ] **DELETE/tombstone semantics** (X0-38) — `blocked: product decision required`

### Rate Limiting and Throttling

- [x] **Retry-After header support** (honor server guidance on 429) — `NS`
- [x] **Adaptive throttling** (persistent multiplier, x1.5 after 3 consecutive 429s, gradual -0.1 recovery) — `NS`
- [x] **Exponential backoff capped at 60s** — `NS`
- [x] **Jitter** (25% random, prevent synchronized retry storms) — `NS`
- [x] **Sync map pre-fetch cache** (eliminates per-record lookups) — `NS`
- [x] **Rate limit discovery** (100 req/min sustained, 100 req/sec burst) — `NS`
- [x] **Preload infinite loop fix** (pagination was looping forever) — `NS`
- [ ] **Batch GraphQL mutations** (reduce per-record API calls further) — `deferred: direct DB path supersedes for bulk sync`

### Data Accuracy

- [x] **Column alias audit** (cv_amount_cents to cv_amount, shipping_cost_cents to shipping_cents, discount_cents to discount_amount_cents) — `NS`
- [x] **Enum mapping audit** (ambassador ranks, commission statuses, order statuses, fulfillment statuses) — `NS`
- [x] **Order status derivation fix** (derive from payment_status, not fulfillment_status) — `NS`
- [x] **Sponsor display name bug fix** (was setting UUID, now omitted) — `NS`
- [x] **Products CV amounts verified** (5/5 show real values in Twenty) — `NS`
- [x] **Ambassador levels verified** (SILVER:3, GOLD:1, ELITE:1, SEED:195) — `NS`
- [x] **Order statuses verified** (PAID:34, OPEN:87, CANCELLED:5) — `NS`
- [x] **Payments sync + verification** (126/126 parity on derived `_xopurePayment`; 76/76 parity on real `_xopureRaw_payments`) — `NS`
- [x] **Commission sync + verification** (108/108 parity after direct DB update + 10 missing inserts) — `NS`
- [x] **Order items sync + verification** (103/103 in `_xopureRaw_order_items`, hashed) — `NS`
- [ ] **profiles source table** (no canonical public people table; blocked until `profiles`, `auth.users`, or equivalent is exposed) — `blocked`
- [x] **Missing columns audit** (classified into alias-only, remove, derive-later, or blocked-source buckets) — `NS`
- [x] **Hash coverage for all synced tables** (46 tables, 2,557 hashes, full adversarial audit passes) — `NS`
- [x] **Support tickets specifically covered** (5/5 hashed, 5/5 values match) — `NS`
- [x] **Real vs derived payments resolved** (keep both: `_xopurePayment` = order-derived view, `_xopureRaw_payments` = real payment transactions) — `NS`

### Dashboards

- [x] **Ops Command Center blueprint** (6 tabs, 20 widgets, 3 views) — `NS`
- [x] **Ops Command Center applied** (live on crm.xopure.com, dashboard id: 6acec309) — `NS`
- [x] **Orders Dashboard** (DB-applied, live metadata row exists) — `NS`
- [x] **Payments Dashboard** (DB-applied, live metadata row exists) — `NS`
- [x] **Fulfillment Dashboard** (DB-applied, live metadata row exists) — `NS`
- [x] **Risk / Exceptions Dashboard** (DB-applied, live metadata row exists) — `NS`
- [ ] **Dashboard semantic parity audit** (some widget titles imply filters/sorts not present in blueprints) — `open: X0-43`
- [ ] **Customer Dashboard** (blocked: `xopureCustomer` is empty, `retailProspect`/`influencerProspect` are empty, and canonical profiles source is unresolved) — `blocked`
- [x] **Ambassador Dashboard** (DB-applied as `Ambassador Command Center`, live metadata row exists) — `NS`
- [x] **Support Dashboard** (DB-applied, 5 widgets, object and data now surfaced) — `NS`
- [x] **Comp Integrity Dashboard** (DB-applied, live metadata row exists) — `NS`

### Security and Ops

- [ ] **Rotate production API key** (X0-24, key was shared in chat, still works but exposed) — `blocked: requires user credentials / access-token flow`
- [x] **Move SDK packages to devDependencies** (X0-31, build warning) — `NS`
- [x] **Document local SDK build prerequisites** (X0-32, tsgo binary missing) — `NS`
- [ ] **Set XOPURE_SUPABASE_READONLY_DSN on Railway worker** (currently local-only) — `blocked: prod Railway env change forbidden by AGENTS.md`

### Support Ticket System

- [x] **xopureSupportTicket object surfaced in live Twenty metadata** — `NS`
- [x] **_xopureSupportTicket table created and synced** (5/5 rows) — `NS`
- [x] **Support tickets hashed and linked to Supabase source URLs** — `NS`
- [x] **Support Dashboard applied** (1 layout, 5 widgets) — `NS`
- [ ] **Live task auto-creation workflow activation** — `blocked: requires app deploy/install` (X0-53)

---

## Architecture

```
+-----------------+     read-only      +------------------+
|   Supabase      | ---- psql/DSN ---- |  Twenty Worker   |
| (source of      |                    |  (xopure-crm)    |
|  truth)         | ---- REST GET ---- |                  |
+-----------------+     (fallback)     +--------+---------+
                                                 |
                                          upsert + sync map
                                                 |
                                        +--------v---------+
                                        |  Twenty CRM       |
                                        |  crm.xopure.com   |
                                        |  (read-only       |
                                        |   command center) |
                                        +-------------------+
```

**Inviolable rule**: The sync pipeline never writes to Supabase.

### Sync Lanes

| Lane | Trigger | Latency | Reliability |
|---|---|---|---|
| Scheduled backfill | Twenty scheduled worker or manual CLI | minutes | Required safety net |
| Webhook | Supabase table-change event | near-real-time | Optional (needs Supabase config) |

### Source Reader Priority

1. XOPURE_SUPABASE_READONLY_DSN (xo_readonly Postgres role)
2. XOPURE_SUPABASE_READONLY_REST_URL + KEY (publishable/anon, GET only)

### Rate Limits (Twenty CRM production)

| Window | Limit | Notes |
|---|---|---|
| Short (1 second) | 100 req/sec | Burst allowed |
| Long (60 seconds) | 100 req/min | Binding constraint |
| Optimal sync pace | --delay=700 | 85 req/min, safely under limit |
| Auth block | 401 after excessive 429s | Temporary, lifts after cooldown |
| Bulk sync workaround | Direct DB write | Zero API calls, completes in seconds |

---

## Credential Inventory

| Credential | Where | Permissions | Writes Supabase? |
|---|---|---|---|
| xo_readonly Postgres role | XOPURE_SUPABASE_READONLY_DSN | SELECT on public.* | No |
| Supabase publishable key | Railway | PostgREST anon | No |
| Supabase service_role key | Railway | Full admin | Yes, never used |
| Twenty API key | XOPURE_TWENTY_API_KEY env | Twenty workspace CRUD | Writes to Twenty only |

API key rotation: `tw3nty api-key <email> <password>` (requires user login, not API key auth).

---

## Current Data Pipeline (2026-06-19)

| Source Table | Rows | Twenty Target | Synced | Verified |
|---|---|---|---|---|
| public.products | 5 | xopureProduct | 5/5 | 100% parity |
| public.affiliates | 215 | xopureAmbassador + xopureReferralRelationship | 215/215 | Levels + status verified |
| public.orders | 126 | xopureOrder | 126/126 | 100% parity |
| public.orders (derived) | 126 | xopurePayment | 126/126 | 100% parity |
| public.payments (real) | 76 | _xopureRaw_payments | 76/76 | 100% parity |
| public.order_items | 103 | _xopureRaw_order_items | 103/103 | 100% parity |
| public.commission_ledger | 108 | xopureCommission | 108/108 | 100% parity |
| 42 additional non-empty tables | 2,103 total | _xopureRaw_* | 2,103/2,103 | Count parity + hash coverage |
| public.customer_expertise | 0 | xopureCustomer | N/A | N/A |
| public.support_tickets | 5 | xopureSupportTicket + _xopureRaw_support_tickets | 5/5 | object, hashes, dashboard live |
| public.profiles | N/A | people | N/A | Table does not exist in public |

### Hash Coverage

- **46 tables** hashed
- **2,557 total hashes** seeded
- **100% adversarial audit pass** across products, orders, payments, commissions, support tickets, and all raw tables
- Supports:
  - unchanged detection (skip)
  - changed detection (hash mismatch)
  - deleted detection (stored but not in source)
  - new detection (in source but not in stored)
  - tail-row verification (last record per table)

### Profiles / People Source Gap

- There is **no canonical public people/profile table** on the current public-only Supabase surface.
- `public.profiles` does **not** exist.
- Current public fragments are only:
  - `affiliates` → ambassador-only `name/email/phone`
  - `orders.user_email` → customer email only
  - `customer_expertise.customer_id` → customer ID only
- The intended canonical source still appears to be `profiles / auth.users`, which is **not** exposed to the current read-only public sync.
- Result: the **profiles source table gap remains blocked** until a canonical people source is intentionally exposed.

### Missing / Ghost Field Audit

**Alias-only (real source exists, mapper/view name was wrong):**
- `xopureProduct.cvAmount` ← `products.cv_amount_cents`
- `xopureOrder.shippingCents` ← `orders.shipping_cost_cents`
- `xopureOrder.discountCents` ← `orders.discount_cents`
- `xopureCommission.payableAt` ← likely `commission_ledger.release_at`

**Remove from expectations (no live backing column):**
- `xopureProduct.slug`
- `xopureProduct.productUrl`
- `xopureOrder.commerceOrderId`
- `xopurePayment.description`

**Derive later from other tables / queries:**
- `xopureAmbassador.sponsorDisplayName` ← self-join `affiliates.parent_id -> affiliates.id/name`
- ambassador commission rollups (`held/payable/paid/lifetime/lastCommissionAt/totalCommissionEarned*`) ← aggregate from `commission_ledger`
- `xopureCustomer.email/lifetimeValue*/orderCount/lastOrderAt` ← aggregate from `orders`
- `xopureOrder.refundCents` / `xopurePayment.refundCents` ← aggregate from `payment_refunds`
- `xopureOrderLine.cvAmount` ← join `order_items.product_id -> products.cv_amount_cents`
- display-money fields (`orderTotal`, `commission.amount`, `attributedRevenue`, `totalCommissionEarned`, `lifetimeValue`) ← derived from cent fields

**Blocked until different source exists:**
- `xopureCustomer.name` (no canonical people source)
- `xopureProduct.stockQuantity` (no investigated public inventory source)

---

## Operating Commands

```bash
# Dry-run
yarn sync:backfill

# Live sync at correct pace (85 req/min, under 100/min limit)
yarn sync:backfill --live --delay=700 --retry=5

# Single table
yarn sync:backfill --live --source-table=payments --delay=700 --retry=5

# Apply dashboard blueprint
yarn dashboard:apply --blueprint ops-command-center --create-dashboard

# Apply dashboard blueprint directly to DB (bypasses Twenty API rate limits)
yarn dashboard:apply:db --blueprint orders-dashboard --create-dashboard
```

### Environment Variables

| Variable | Required For |
|---|---|
| XOPURE_SUPABASE_READONLY_DSN | Postgres reader (preferred) |
| XOPURE_SUPABASE_READONLY_REST_URL | REST reader (fallback) |
| XOPURE_SUPABASE_READONLY_REST_KEY | REST reader (fallback) |
| XOPURE_TWENTY_API_URL | Twenty writes |
| XOPURE_TWENTY_API_KEY | Twenty writes |

---

## Dashboard Roadmap

### Phase 1 — Protect the Business

- [x] Ops Command Center (MVP) — live
- [x] Orders Dashboard — `NS`
- [x] Payments Dashboard — `NS`
- [x] Fulfillment Dashboard — `NS`
- [x] Risk / Exceptions Dashboard — `NS`

### Phase 2 — Protect Trust

- [ ] Customer Dashboard — `blocked`
- [x] Ambassador Dashboard — `NS`
- [ ] Support Dashboard — `blocked`
- [x] Comp Integrity Dashboard — `NS`

### Phase 3 — Grow Smarter

- [ ] Marketing Leads — `deferred` (no supported live prospect/source pipeline yet)
- [ ] Retail Outreach — `deferred` (no supported live prospect/source pipeline yet)
- [ ] Reports — `blocked` (no reporting blueprint/object/data pipeline yet)

---

## Ops Command Center (Live)

**Status**: Live on crm.xopure.com. Applied 2026-06-19.
Blueprint: `src/dashboards/blueprints/ops-command-center.blueprint.ts`

| Tab | Content |
|---|---|
| Overview | Total Orders, Gross Revenue, Order Status Mix, Payment Status Mix |
| Fulfillment | Paid But Not Fulfilled, Fulfillment Status, Recent Orders table |
| Payments | Payment Volume, Total Payments, Payment Status Mix, Provider Mix |
| Ambassadors | Total Ambassadors, Held Commissions, Status Mix, Level Mix |
| Commissions | Commission Amount, Count, Status Mix, Recent Commissions table |
| Exceptions | Exception Commissions table for held/pending review |

### Additional dashboard layouts now present in Twenty metadata

- Ambassador Command Center
- Orders Dashboard
- Payments Dashboard
- Fulfillment Dashboard
- Risk / Exceptions Dashboard
- Comp Integrity Dashboard
- Support Dashboard

**Visual verification status:** metadata rows exist for all feasible dashboards, but live browser/session tooling has not yet provided a stable authenticated path to claim pixel-perfect visual verification of every page. Treat dashboard creation as verified and visual inspection as still pending/manual.

**Semantic parity status:** blueprint scouts found several widgets whose **titles imply filtered subsets** but whose blueprints currently query **unfiltered full-object data**. Until X0-43 is closed, do **not** assume those widgets are forensic-ready just because the dashboard exists.

Known examples:
- Ops Command Center → **Failed Payments (count)** counts all `xopurePayment` rows, not failed-only.
- Ops Command Center → **Fulfillment Status** groups by `status`, not `fulfillmentStatus`.
- Ops Command Center → **Paid But Not Fulfilled** is an unfiltered fulfillment-status mix.
- Orders Dashboard → **Recent / Refunded / Cancelled / Manual Review Orders** has no filter/sort.
- Payments Dashboard → **Payment Exceptions** has no exception filter.
- Risk / Exceptions → exception-style tables rely on naming, not widget-level filters in the blueprint.

### Revenue math corrections now live

The most misleading money widgets were corrected in both source blueprints and live DB metadata:

- **Ops Command Center → Paid / Fulfilled Revenue** = `SUM(xopureOrder.orderTotal)` filtered to `status IN [PAID, FULFILLED]`
- **Ops Command Center → Successful Payment Volume** = `SUM(xopurePayment.amount)` filtered to `status = SUCCEEDED`
- **Orders Dashboard → Paid / Fulfilled Revenue** = `SUM(xopureOrder.orderTotal)` filtered to `status IN [PAID, FULFILLED]`
- **Payments Dashboard → Successful Payment Amount** = `SUM(xopurePayment.amount)` filtered to `status = SUCCEEDED`
- **Payments Dashboard → Refund Amount** = `SUM(xopurePayment.refundAmount)` filtered to `status IN [REFUNDED, PARTIALLY_REFUNDED]`

DB truth at fix time:
- Paid / fulfilled order revenue = **13,175.18**
- Successful payment amount = **13,377.55**
- Refund amount = **0.00**

`X0-54` closed these order/payment money semantics. `X0-43` remains open for the broader title/filter parity sweep on non-money widgets.

### The Money Display Rule

Dollar fields are the **primary UI fields**. Cent fields are **forensic only**.

- Use dollar fields (for example `orderTotal`, `amount`, `refundAmount`, `teamVolume`, `heldCommission`) in dashboards, widget aggregates, and operator-facing record tables.
- Keep `*Cents` fields for sync, parity, audit, and drill-down only.
- Do not expose raw cent values as the primary number in user-facing widgets.
- If only cents exist upstream, derive the dollar field in the sync or DB layer first, then point UI metadata at the dollar field.

---

## Key Source Files

| File | Purpose |
|---|---|
| read-supabase-source.ts | Postgres DSN reader (xo_readonly to public.*) |
| read-supabase-rest-source.ts | REST fallback + any-env selector |
| run-xopure-backfill.ts | Backfill orchestrator |
| twenty-rest-client.ts | Twenty REST adapter (retry, throttle, cache) |
| cli/run-xopure-backfill.ts | CLI runner + sync map cache |
| cli/apply-dashboard-blueprint-db.ts | Direct DB dashboard apply (bypasses API rate limits) |
| map-supabase-record.ts | Row-to-Twenty mapper |
| upsert-twenty-record.ts | Idempotent upsert |
| _xopureSyncHash | New hash table in Twenty DB (sourceTable, sourceId, contentHash, syncedAt) |
| supabase-sync-webhook-handler.ts | Webhook handler (orders to payments fanout) |
| supabase-reconciliation-schedule.ts | Scheduled worker |
| ops-command-center.blueprint.ts | Ops Command Center dashboard |

---

## Tracking Issues

| Issue | Title | Status | Owner |
|---|---|---|---|
| X0-21 | Document read-only source design | done | NS |
| X0-22 | Implement read-only source reader | done | NS |
| X0-24 | Rotate production API key | open | unclaimed |
| X0-26 | Run Supabase to Twenty sync | done | NS |
| X0-27 | REST reader missing product slug column | done | NS |
| X0-28 | Prod Twenty missing custom objects | done | NS |
| X0-31 | Move SDK packages to devDependencies | done | NS |
| X0-32 | Document local SDK build prerequisites | done | NS |
| X0-35 | Continue sync logic | done | NS |
| X0-37 | Implement realtime sync path | done | NS |
| X0-38 | Delete/tombstone semantics | open | unclaimed |
| X0-41 | Close remaining CRM Bible gaps | done | NS |
| X0-42 | Close feasible dashboard gaps | done | NS |
| X0-43 | Audit and fix dashboard widgets whose titles imply missing filters | open | unclaimed |
| X0-44 | Forensically audit all order and payment math | done | NS |
| X0-45 | Surface support tickets in Twenty CRM with auto-task workflow | done | NS |
| X0-53 | Activate live support-ticket task auto-creation | open | unclaimed |
| X0-54 | Exclude failed and cancelled orders from revenue totals | done | NS |
| X0-39 | Claim and implement Xopure dashboard adjacent gap | done | t2 |
| X0-40 | DISCOVERY: GitNexus detect-changes cannot resolve Xopure repo | backlog | t2 |

---

### Local SDK Build Prerequisites

`tw3nty build packages/twenty-apps/internal/xopure-crm --tarball` depends on local Twenty SDK build outputs. The `packages/twenty-sdk` build chain requires `tsgo`, so if you hit `tsgo: command not found`, install/build the local SDK dependencies before running `tw3nty build`.

Package-local verification commands already used in this repo:

```bash
yarn test
yarn tsc -p tsconfig.spec.json --noEmit
yarn lint
tw3nty build packages/twenty-apps/internal/xopure-crm --tarball
```

## Verification

```bash
cd packages/twenty-apps/internal/xopure-crm
yarn test                    # 17 files, 111 tests
yarn tsc -p tsconfig.spec.json --noEmit
yarn lint                    # 0 warnings, 0 errors
bash -n scripts/xopure/check-supabase-env.sh
tw3nty build packages/twenty-apps/internal/xopure-crm --tarball

# Forensic parity audit (SQL-only, zero API calls)
# Confirms 100% hash parity per table
```

---

## The Rule

CRM DOES NOT CHANGE SUPABASE.

Every feature, every dashboard, every query must uphold this.
If a proposed change requires writing to Supabase, the design is wrong.
If a credential can write to Supabase, it must not be used by the CRM.
The xo_readonly role is the standard. Nothing lower.
