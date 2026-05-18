# XO Pure CRM — Supabase-to-Twenty Sync Specification

**Version**: 2.0.0
**Last Updated**: 2026-05-18
**Status**: Phase 1 implemented, Phase 2+ deferred

---

## 1. Overview

XO Pure CRM is a Twenty app that mirrors selected Supabase commerce data into Twenty CRM for operational use — customer support, ambassador management, commission tracking, and sales workflows.

### 1.1 Core Principle

```
Supabase = source of truth (engine)
Twenty   = operational cockpit (visibility, workflows, tasks)
```

Twenty never writes back to Supabase core tables. All sync is one-directional.

### 1.2 Sync Direction

```
Supabase table changes
  → Supabase webhook (INSERT/UPDATE)
  → Twenty logic function (/xopure/sync/supabase)
  → transform via explicit allow-list mapper
  → upsert into Twenty custom objects
  → write sync state to Twenty-side xopureSyncMap
```

### 1.3 What Twenty Controls

- Visibility into customers, orders, ambassadors, commissions
- Task assignment and follow-up workflows
- Owner assignment and pipeline stages
- Notes and activity logging
- Sales/admin workflow orchestration

### 1.4 What Supabase Controls

- Money, commissions, orders, payments
- Fulfillment, shipping, tax
- Auth, roles, permissions
- Business logic and truth

---

## 2. Architecture

### 2.1 Components

| Component | File | Purpose |
|---|---|---|
| Webhook endpoint | `logic-functions/supabase-sync-webhook.ts` | Receives Supabase webhook POST |
| Webhook handler | `logic-functions/handlers/supabase-sync-webhook-handler.ts` | Auth, parse, map, upsert |
| Mapper | `supabase-sync/utils/map-supabase-record.ts` | Per-table field extraction with allow-lists |
| Upsert engine | `supabase-sync/utils/upsert-twenty-record.ts` | Idempotent create/update with skip-on-hash |
| Relation resolver | `supabase-sync/utils/resolve-xopure-relations.ts` | Resolves external IDs to Twenty record IDs |
| Sync map manager | `supabase-sync/utils/upsert-sync-map.ts` | Creates/updates idempotency records |
| Record finder | `supabase-sync/utils/find-existing-twenty-record.ts` | Looks up existing records by external ID |
| Content hash | `supabase-sync/utils/compute-content-hash.ts` | SHA-256 stable hash for skip detection |
| Source table config | `supabase-sync/constants/source-table-mapping.ts` | Maps source tables to Twenty objects/mutations |
| Backfill runner | `supabase-sync/backfill/backfill-runner.ts` | Dry-run batch mapper (no write path yet) |

### 2.2 Data Flow

```
Supabase Webhook
  │
  ├─ POST /xopure/sync/supabase
  │  Headers: x-xopure-sync-secret
  │  Body: { type, table, schema, record, old_record }
  │
  ▼
Webhook Handler
  ├─ Validate secret (401 if mismatch)
  ├─ Parse payload (400 if malformed)
  ├─ Resolve table alias (e.g., 'order' → 'orders')
  ├─ Map record via allow-list mapper
  │   ├─ UNSUPPORTED_SOURCE_TABLE → 202 accepted, skipped
  │   ├─ MISSING_SOURCE_ID → 400
  │   └─ MALFORMED_RECORD → 400
  ├─ Resolve relations (external ID → Twenty record ID)
  │   └─ MISSING_REQUIRED_RELATION → 409 (retryable)
  ├─ Check sync map (skip if content hash matches)
  ├─ Upsert Twenty record (create or update)
  └─ Update sync map with result
```

### 2.3 Idempotency

Every sync operation writes to `xopureSyncMap`:

```
syncKey: "supabase.public.<table>.<record_id>"   (unique)
payloadHash: SHA-256(sorted JSON of mapped fields)
targetRecordId: Twenty record UUID
lastStatus: SYNCED | FAILED_RETRYABLE | FAILED_PERMANENT
```

On re-sync: if `payloadHash` matches, the record is skipped without mutation.

### 2.4 Content Hash

SHA-256 over `JSON.stringify({targetObject, externalIdField, externalIdValue, fieldValues})` with sorted keys. Covers all mapped field values — any change invalidates the hash.

---

## 3. Source Tables

### 3.1 Supported Tables (Phase 1)

| Source Table | Target Object | External ID Field | Aliases |
|---|---|---|---|
| `profiles` | `person` (built-in) | `xopureSupabasePersonId` | `profile` |
| `customer_expertise` | `xopureCustomer` | `supabaseCustomerId` | `customer` |
| `affiliates` | `xopureAmbassador` | `supabaseAmbassadorId` | `ambassador` |
| `products` | `xopureProduct` | `supabaseProductId` | `product` |
| `orders` | `xopureOrder` | `supabaseOrderId` | `order` |
| `order_items` | `xopureOrderLine` | `supabaseOrderItemId` | `order_item` |
| `commission_ledger` | `xopureCommission` | `supabaseCommissionId` | `commission` |

### 3.2 Backfill Dependency Order

```
products → profiles → customer_expertise → affiliates → orders → order_items → commission_ledger
```

Products and profiles have no dependencies. Orders depend on customers and ambassadors. Order items depend on orders and products. Commissions depend on ambassadors and orders.

---

## 4. Object Definitions

### 4.1 Person (built-in Twenty object)

Custom field added to Twenty's built-in `person` object.

| Field | Type | Unique | Source |
|---|---|---|---|
| `xopureSupabasePersonId` | TEXT | yes | `profiles.id` |

Mapper output:

| Field | Source | Notes |
|---|---|---|
| `xopureSupabasePersonId` | `record.id` | |
| `name.firstName` | `record.first_name` | |
| `name.lastName` | `record.last_name` | |
| `emails.primaryEmail` | `record.email` | |
| `phones.primaryPhoneNumber` | `record.phone` | Optional |
| `lastSyncedAt` | `record.updated_at` / `record.created_at` | |

### 4.2 xopureCustomer

| Field | Type | Unique | Default | Source |
|---|---|---|---|---|
| `name` | TEXT | | | `record.name` / `record.email` / `record.customer_id` |
| `supabaseCustomerId` | TEXT | yes | | `record.customer_id` / `record.id` |
| `email` | TEXT | | | `record.email` |
| `commerceCustomerId` | TEXT | | | (reserved) |
| `status` | SELECT | | `ACTIVE` | Hardcoded `ACTIVE` |
| `coreTags` | MULTI_SELECT | | `[CUSTOMER]` | Hardcoded `['CUSTOMER']` |
| `lifetimeValue` | NUMBER | | 0 | (display field) |
| `lifetimeValueCents` | NUMBER | | 0 | `record.lifetime_value_cents` |
| `orderCount` | NUMBER | | 0 | `record.order_count` |
| `lastOrderAt` | DATE_TIME | | null | `record.last_order_at` |
| `lastSyncedAt` | DATE_TIME | | null | `record.updated_at` |

Status options: `ACTIVE`, `VIP`, `AT_RISK`, `INACTIVE`
Core tags: `CUSTOMER`, `AMBASSADOR`, `WHOLESALE`, `SUBSCRIPTION`, `VIP`

Relations:
- `customer` → `xopureOrder` (ONE_TO_MANY, via `orders-on-customer.field.ts`)

### 4.3 xopureAmbassador

| Field | Type | Unique | Default | Source |
|---|---|---|---|---|
| `name` | TEXT | | | `record.name` / `record.email` |
| `supabaseAmbassadorId` | TEXT | yes | | `record.id` |
| `supabaseUserId` | TEXT | | | `record.user_id` |
| `email` | TEXT | | | `record.email` |
| `level` | SELECT | | `SEED` | Derived from `record.paid_as_rank` / `record.career_rank` |
| `status` | SELECT | | `APPLIED` | Normalized from `record.status` |
| `referralCode` | TEXT | | | `record.tracking_code` |
| `sponsorAmbassadorExternalId` | TEXT | | | `record.parent_id` |
| `sponsorDisplayName` | TEXT | | | `record.parent_id` |
| `commissionRate` | NUMBER | | 0 | `record.commission_rate` |
| `careerRank` | TEXT | | | `record.career_rank` |
| `paidAsRank` | TEXT | | | `record.paid_as_rank` |
| `personalVolumeCents` | NUMBER | | 0 | `record.personal_volume_cents` |
| `teamVolumeCents` | NUMBER | | 0 | `record.team_volume_cents` |
| `activeCustomerCount` | NUMBER | | 0 | `record.active_customer_count` |
| `attributedRevenue` | NUMBER | | 0 | (display field) |
| `attributedRevenueCents` | NUMBER | | 0 | `record.team_volume_cents` |
| `totalCommissionEarned` | NUMBER | | 0 | (display field) |
| `totalCommissionEarnedCents` | NUMBER | | 0 | Hardcoded 0 |
| `researchSummary` | TEXT | | | `record.reason` |
| `phone` | TEXT | | | `record.phone` |
| `showPeptidesLink` | BOOLEAN | | false | `record.show_peptides_link` |
| `heldCommissionCents` | NUMBER | | 0 | `record.held_commission_cents` |
| `payableCommissionCents` | NUMBER | | 0 | `record.payable_commission_cents` |
| `paidCommissionCents` | NUMBER | | 0 | `record.paid_commission_cents` |
| `lifetimeCommissionCents` | NUMBER | | 0 | `record.lifetime_commission_cents` / fallback `record.total_commission_earned_cents` |
| `lastCommissionAt` | DATE_TIME | | null | `record.last_commission_at` |
| `lastSyncedAt` | DATE_TIME | | null | `record.updated_at` |

Level options: `SEED`, `BRONZE`, `SILVER`, `GOLD`, `PLATINUM`, `ELITE`
Status options: `APPLIED`, `APPROVED`, `ACTIVE`, `PAUSED`, `REJECTED`

Status mapping from Supabase:

| Supabase value | Twenty status |
|---|---|
| `PENDING`, `APPLIED` | `APPLIED` |
| `APPROVED` | `APPROVED` |
| `ACTIVE`, `ACTIVE_AFFILIATE` | `ACTIVE` |
| `PAUSED`, `INACTIVE` | `PAUSED` |
| `REJECTED` | `REJECTED` |
| (anything else) | `APPLIED` |

Relations:
- `commissions` → `xopureCommission` (ONE_TO_MANY)
- `orders` → `xopureOrder` (ONE_TO_MANY)

### 4.4 xopureProduct

| Field | Type | Unique | Default | Source |
|---|---|---|---|---|
| `name` | TEXT | | | `record.name` / `record.sku` |
| `supabaseProductId` | TEXT | yes | | `record.id` |
| `sku` | TEXT | | | `record.sku` |
| `slug` | TEXT | | | `record.slug` |
| `priceCents` | NUMBER | | 0 | `record.price_cents` |
| `currency` | TEXT | | `USD` | `record.currency` |
| `category` | TEXT | | | `record.category` |
| `status` | SELECT | | `ACTIVE` | Derived from `active`, `pre_order`, `featured` |
| `stockQuantity` | NUMBER | | 0 | `record.stock_quantity` |
| `cvAmount` | NUMBER | | 0 | `record.cv_amount` |
| `productUrl` | TEXT | | | `record.product_url` |
| `lastSyncedAt` | DATE_TIME | | null | `record.updated_at` |

Status options: `ACTIVE`, `INACTIVE`, `PRE_ORDER`, `FEATURED`

Status logic:
- `pre_order === true` → `PRE_ORDER`
- `featured === true` → `FEATURED`
- `active === false` → `INACTIVE`
- Otherwise → `ACTIVE`

### 4.5 xopureOrder

| Field | Type | Unique | Default | Source |
|---|---|---|---|---|
| `orderNumber` | TEXT | | | `record.id` |
| `supabaseOrderId` | TEXT | yes | | `record.id` |
| `commerceOrderId` | TEXT | | | `record.commerce_order_id` |
| `status` | SELECT | | `OPEN` | Derived from `record.fulfillment_status` |
| `orderTotal` | NUMBER | | 0 | (display only, not populated by sync) |
| `subtotalCents` | NUMBER | | 0 | `record.subtotal_cents` |
| `shippingCents` | NUMBER | | 0 | `record.shipping_cents` |
| `taxCents` | NUMBER | | 0 | `record.tax_cents` |
| `discountCents` | NUMBER | | 0 | `record.discount_amount_cents` |
| `refundCents` | NUMBER | | 0 | `record.refund_amount_cents` |
| `totalCents` | NUMBER | | 0 | `record.total_cents` / fallback `record.subtotal_cents` |
| `currency` | TEXT | | `USD` | `record.currency` |
| `paymentStatus` | TEXT | | | Raw `record.payment_status` (normalized uppercase) |
| `orderedAt` | DATE_TIME | | null | `record.created_at` |
| `customerExternalId` | TEXT | | | `record.customer_id` / `record.user_email` |
| `customerEmail` | TEXT | | | `record.user_email` |
| `ambassadorCode` | TEXT | | | `record.affiliate_chain[0]` |
| `ambassadorExternalId` | TEXT | | | `record.affiliate_chain[0]` |
| `commissionable` | BOOLEAN | | false | `(record.cv_amount > 0)` |
| `cvAmount` | NUMBER | | 0 | `record.cv_amount` |
| `buyerType` | TEXT | | | `record.buyer_type` |
| `fulfillmentStatus` | SELECT | | `NOT_READY` | `record.fulfillment_status` |
| `paymentMethodCode` | TEXT | | | `record.payment_method_code` |
| `manualReviewRequired` | BOOLEAN | | false | `record.manual_review_required` |
| `trackingNumber` | TEXT | | | `record.tracking_number` |
| `trackingUrl` | TEXT | | | `record.tracking_url` |
| `shippedAt` | DATE_TIME | | null | `record.shipped_at` |
| `deliveredAt` | DATE_TIME | | null | `record.delivered_at` |
| `lastSyncedAt` | DATE_TIME | | null | `record.updated_at` |

Status options: `OPEN`, `PAID`, `FULFILLED`, `REFUNDED`, `CANCELLED`
Fulfillment status options: `NOT_READY`, `READY`, `SYNCED`, `SHIPPED`

Status mapping from `fulfillment_status`:

| Supabase value | Twenty status |
|---|---|
| `PAID`, `SUCCEEDED`, `COMPLETE` | `PAID` |
| `FULFILLED`, `SHIPPED` | `FULFILLED` |
| `REFUNDED`, `PARTIALLY_REFUNDED` | `REFUNDED` |
| `CANCELLED`, `CANCELED` | `CANCELLED` |
| (anything else) | `OPEN` |

Fulfillment status mapping:

| Supabase value | Twenty status |
|---|---|
| `READY` | `READY` |
| `SYNCED` | `SYNCED` |
| `SHIPPED` | `SHIPPED` |
| (anything else) | `NOT_READY` |

Relations:
- `customer` → `xopureCustomer` (MANY_TO_ONE, optional)
- `ambassador` → `xopureAmbassador` (MANY_TO_ONE, optional)

### 4.6 xopureOrderLine

| Field | Type | Unique | Default | Source |
|---|---|---|---|---|
| `name` | TEXT | | | `record.name` / `record.sku` |
| `supabaseOrderItemId` | TEXT | yes | | `record.id` |
| `supabaseOrderId` | TEXT | | | `record.order_id` |
| `supabaseProductId` | TEXT | | | `record.product_id` |
| `sku` | TEXT | | | `record.sku` |
| `quantity` | NUMBER | | 1 | `record.quantity` |
| `unitPriceCents` | NUMBER | | 0 | `record.unit_price_cents` |
| `lineTotalCents` | NUMBER | | 0 | `record.line_total_cents` |
| `cvAmount` | NUMBER | | 0 | `record.cv_amount` |
| `category` | TEXT | | | `record.category` |
| `lastSyncedAt` | DATE_TIME | | null | `record.updated_at` |

Relations:
- `order` → `xopureOrder` (MANY_TO_ONE, required)
- `product` → `xopureProduct` (MANY_TO_ONE, required)

### 4.7 xopureCommission

| Field | Type | Unique | Default | Source |
|---|---|---|---|---|
| `name` | TEXT | | | `"{status} {id}"` |
| `supabaseCommissionId` | TEXT | yes | | `record.id` |
| `ambassadorExternalId` | TEXT | | | `record.affiliate_id` |
| `orderExternalId` | TEXT | | | `record.order_id` |
| `amount` | NUMBER | | 0 | (display only, not populated by sync) |
| `amountCents` | NUMBER | | 0 | `record.amount_cents` |
| `rate` | NUMBER | | 0 | `record.rate_used * 100` or `record.percentage_bps / 100` |
| `status` | SELECT | | `PENDING` | Normalized from `record.status` |
| `paidAt` | DATE_TIME | | null | `record.paid_at` |
| `payArea` | TEXT | | | `record.pay_area` |
| `periodId` | TEXT | | | `record.period_id` |
| `holdUntil` | DATE_TIME | | null | `record.hold_until` |
| `baseCvAmount` | NUMBER | | 0 | `record.base_cv_amount` |
| `sourceOrderId` | TEXT | | | `record.source_order_id` / fallback `record.order_id` |
| `payableAt` | DATE_TIME | | null | `record.payable_at` |
| `lastSyncedAt` | DATE_TIME | | null | `record.updated_at` |

Status options: `PENDING`, `APPROVED`, `PAID`, `VOID`, `HELD`

Status mapping:

| Supabase value | Twenty status |
|---|---|
| `HELD`, `HOLD` | `HELD` |
| `APPROVED` | `APPROVED` |
| `PAID` | `PAID` |
| `VOID`, `CANCELLED`, `CANCELED` | `VOID` |
| (anything else) | `PENDING` |

Rate calculation:
- If `rate_used` present: `rate = rate_used * 100` (e.g., 0.20 → 20)
- Else if `percentage_bps` present: `rate = percentage_bps / 100` (e.g., 2000 → 20)
- Else: `0`

Relations:
- `ambassador` → `xopureAmbassador` (MANY_TO_ONE, required)
- `order` → `xopureOrder` (MANY_TO_ONE, optional)

### 4.8 xopureSyncMap (technical object)

| Field | Type | Unique | Notes |
|---|---|---|---|
| `syncKey` | TEXT | yes | `supabase.public.<table>.<id>` |
| `sourceSystem` | TEXT | | Always `supabase` |
| `sourceSchema` | TEXT | | Usually `public` |
| `sourceTable` | TEXT | | e.g., `orders` |
| `sourceRecordId` | TEXT | | Supabase record ID |
| `targetObject` | TEXT | | e.g., `xopureOrder` |
| `targetRecordId` | TEXT | nullable | Twenty record UUID (null if failed) |
| `payloadHash` | TEXT | nullable | SHA-256 content hash |
| `lastSyncedAt` | DATE_TIME | nullable | Last successful sync timestamp |
| `lastStatus` | TEXT | | `SYNCED`, `FAILED_RETRYABLE`, `FAILED_PERMANENT` |
| `lastErrorSummary` | TEXT | nullable | Error message if failed |

### 4.9 xopureSyncCursor (technical object)

| Field | Type | Unique | Notes |
|---|---|---|---|
| `step` | TEXT | yes | Backfill step identifier |
| `cursorValue` | TEXT | nullable | Last processed timestamp/ID |
| `lastRunStatus` | TEXT | | Run result status |
| `lastRunAt` | DATE_TIME | nullable | Last run timestamp |
| `lastErrorSummary` | TEXT | nullable | Error if failed |

---

## 5. Webhook API

### 5.1 Endpoint

```
POST /xopure/sync/supabase
```

### 5.2 Authentication

Header: `x-xopure-sync-secret`
Value: Must match `XOPURE_SYNC_WEBHOOK_SECRET` application variable.

### 5.3 Request Body

```json
{
  "type": "INSERT | UPDATE | DELETE",
  "table": "orders",
  "schema": "public",
  "record": { "id": "...", ... },
  "old_record": { "id": "...", ... }
}
```

Both singular and plural table names are accepted:
`order` / `orders`, `product` / `products`, `ambassador` / `affiliates`, etc.

### 5.4 Response Codes

| Code | Condition | Body |
|---|---|---|
| `200` | Record synced (created/updated/skipped) | `{ ok: true, status, created, updated, skipped, sourceTable, sourceRecordId, targetObject, twentyRecordId, syncMapId }` |
| `202` | Unsupported source table (accepted, skipped) | `{ ok: true, status: 'skipped', skipped: 1 }` |
| `400` | Malformed payload or mapping error | `{ ok: false, status: 'failed', failed: 1, error: { code, message } }` |
| `401` | Missing or wrong sync secret | `{ ok: false, error: { code: 'UNAUTHORIZED' } }` |
| `409` | Retryable failure (e.g., required relation missing) | `{ ok: false, status: 'failed', failed: 1, error: { code, message, retryable: true } }` |

### 5.5 Event Type Handling

| Event | Behavior |
|---|---|
| `INSERT` | Map and upsert |
| `UPDATE` | Map and upsert (skip if content hash unchanged) |
| `DELETE` | **Not handled** — record remains in Twenty. Deferred to Phase 2. |

---

## 6. Excluded Fields (Security)

These Supabase fields are never sent to Twenty:

- `gateway_payload` / `metadata` / `calculation_trace_json`
- `shipping_address` / `payout_details`
- Passwords, auth tokens, service role keys
- Raw provider payloads
- Full SSN/tax IDs
- Private compliance documents

---

## 7. Configuration

### 7.1 Application Variables

| Variable | Secret | Description |
|---|---|---|
| `XOPURE_SYNC_WEBHOOK_SECRET` | yes | Shared secret for Supabase webhook authentication |
| `XOPURE_ENRICHMENT_PROVIDER` | no | Contact enrichment provider (default: `manual`) |

### 7.2 Logic Functions

| Function | Path | Timeout | Auth |
|---|---|---|---|
| `xopure-supabase-sync-webhook` | `/xopure/sync/supabase` | 10s | Secret header |

---

## 8. Deferred (Phase 2+)

Per spec §18 phasing:

| Feature | Phase | Notes |
|---|---|---|
| Payment object (§5.4) | Phase 2 | `payments`, `payment_methods`, `payment_refunds` |
| Payout Batch (§5.6) | Phase 2 | Commission payout tracking |
| Referral Relationship (§5.7) | Phase 2 | Ambassador genealogy |
| Backfill write execution | Phase 1 (incomplete) | Dry-run only; needs Supabase connection config + cursor persistence |
| Retry with exponential backoff | Phase 1 (incomplete) | Failed records marked but no worker reprocesses |
| Rate limiting | Phase 1 (incomplete) | No throttling between sync operations |
| DELETE event handling | Phase 2 | Webhook ignores DELETE; records remain in Twenty |
| Audit trail persistence | Phase 2 | Structured console logs only; no Twenty-side audit records |
| Retail Prospect, Influencer Prospect | Phase 3 | Growth/sales pipeline |
| Support Case | Phase 4 | Customer issue tracking |

---

## 9. Test Coverage

| Test File | Tests | Coverage |
|---|---|---|
| `supabase-record-mapper.spec.ts` | 6 | Allow-list enforcement, hash stability, cents preservation, relations |
| `upsert-twenty-record.spec.ts` | 4 | Create, update, skip-on-hash, failure |
| `supabase-sync-webhook-handler.spec.ts` | 5 | Auth, malformed payload, unsupported table, success, failure |
| `backfill-runner.spec.ts` | 2 | Dry-run mapping, dependency ordering |
| **Total** | **17** | |

Additional spec tests: 10 (app-factory, roles) — 27 total, all passing.
