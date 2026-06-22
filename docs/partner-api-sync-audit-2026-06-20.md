# XO Pure Partner API Sync Audit

Date: 2026-06-20  
Tracked in Multica: X0-56

## Executive summary

The Partner Data API from `local://attachment-1` should **not replace** the
existing Supabase-to-Twenty sync. It is a narrower, curated, read-only
server-to-server API for shipping/order/ambassador lookups. The current local
sync remains the system-of-record lane for CRM hydration because it covers the
canonical commerce tables, support tickets, raw-table hash mirrors, idempotent
upserts, and Twenty-side sync maps.

Recommended direction: treat the Partner API as a **complementary enrichment
lane** for fulfillment status, tracking, fulfillment exceptions, and the new
stable `order_short` business reference.

## Current local sync

The current implementation has two local source readers:

- Postgres read-only DSN via `XOPURE_SUPABASE_READONLY_DSN`.
- Supabase REST fallback via `XOPURE_SUPABASE_READONLY_REST_URL` and
  `XOPURE_SUPABASE_READONLY_REST_KEY`.

Both feed `runXopureBackfill`, which maps records and writes only to Twenty.
The source tables currently supported in code are:

| Source | Twenty target |
|---|---|
| `profiles` | `person` |
| `customer_expertise` | `xopureCustomer` |
| `affiliates` | `xopureAmbassador` + derived `xopureReferralRelationship` |
| `products` | `xopureProduct` |
| `orders` | `xopureOrder` |
| `orders` as logical `payments` | `xopurePayment` |
| `order_items` | `xopureOrderLine` |
| `commission_ledger` | `xopureCommission` |

The CRM Bible also documents the broader direct/parity lane already achieved:

- 46 hashed tables
- 2,557 seeded hashes
- 42 additional non-empty raw tables mirrored as `_xopureRaw_*`
- support tickets covered
- real `public.payments` retained separately from order-derived payments

## Partner API coverage

The Partner API exposes four currently granted scopes/endpoints:

| Endpoint | Main value | Replacement coverage |
|---|---|---|
| `/shipments` | ShipHero sync/tracking fields keyed by `order_short` | Enrichment only |
| `/orders` | Non-PII order summary keyed by `order_short` | Partial overlap with `orders` |
| `/ambassadors` | Non-PII ambassador directory keyed by `ambassador_id` | Partial overlap with `affiliates` |
| `/fulfillment-exceptions` | Operational stuck-fulfillment alerts | New ops lane |

`/order-money-flow` exists in the spec but requires `finance:read`, which is
not currently granted to the CRM key.

## Why it cannot replace Supabase sync

1. **Coverage gap**: Partner API has 4 endpoints; current local sync covers 8
   canonical source-table mappings plus 46-table hash/raw parity.
2. **No product/order-line/commission/payment raw lane**: Partner API has no
   replacement for `products`, `order_items`, `commission_ledger`, real
   `payments`, raw mirrors, or support-ticket hash coverage.
3. **No PII by design**: That is good for security, but it cannot hydrate the
   same CRM person/customer/ambassador fields where email/phone/customer
   context is intentionally synced from Supabase.
4. **Identifier mismatch**: Partner API uses `order_short`
   (`XO-057059F9`). Current `xopureOrder` uses Supabase `id` as both
   `orderNumber` and `supabaseOrderId`. There are no current `order_short`
   references in the sync path.
5. **Different sync state model**: Current sync idempotency is
   `xopureSyncMap.syncKey + payloadHash`; Partner API proposes
   endpoint-level `updated_since` and `next_cursor`.

## Where Partner API is better

| Area | Partner API advantage |
|---|---|
| Least privilege | Scoped `xopk_*` bearer token; no direct DB/table access |
| Runtime safety | No CORS, read-only, audited, server-to-server |
| Incremental reads | `updated_since` + opaque `next_cursor` |
| Fulfillment | Purpose-built `/shipments` and `/fulfillment-exceptions` |
| Business reference | Stable user-facing `order_short` |

## Required integration changes

### 1. Add `order_short` mapping

This is the blocker. To join Partner API shipment/exceptions data to existing
Twenty orders, add a stable field such as `partnerOrderShort` or `orderShort`
to `xopureOrder`, and map it from either:

- a new Supabase source column if available, or
- the Partner API `/orders` response as an enrichment update.

Do not replace `supabaseOrderId`; keep it as the canonical local-source
external ID.

### 2. Add a separate source namespace

Current mapped records hardcode `sourceSystem: 'supabase'`. Partner API records
should use a separate namespace such as `xopure-partner` so sync maps do not
collide:

```text
supabase.public.orders.<uuid>
xopure-partner.shipments.<order_short>
xopure-partner.orders.<order_short>
```

### 3. Store endpoint watermarks

Use the existing `xopureSyncCursor` object for Partner API cursor state:

| Cursor key | Value |
|---|---|
| `partner.shipments` | latest `shiphero_synced_at` and/or `next_cursor` |
| `partner.orders` | latest `created_at` and/or `next_cursor` |
| `partner.ambassadors` | latest `created_at` and/or `next_cursor` |
| `partner.fulfillment-exceptions` | last checked timestamp/window |

### 4. Make it an enrichment pass

Run order as:

1. Supabase canonical sync.
2. Partner API order/ambassador enrichment.
3. Partner API shipments update.
4. Fulfillment exception snapshot/dashboard update.

This avoids duplicate order creation and keeps Supabase as the broad source of
truth while letting Partner API carry curated fulfillment data.

## Risk register

| Risk | Severity | Mitigation |
|---|---:|---|
| Duplicate `xopureOrder` records because `order_short` does not match `supabaseOrderId` | High | Add `orderShort` field and lookup/update existing orders before any create path |
| Treating Partner API as replacement and losing raw/parity coverage | High | Keep Supabase sync; add Partner API as side lane only |
| `finance:read` not granted | Medium | Do not design around `/order-money-flow` until scope is granted |
| Partner API watermark not persisted | Medium | Use `xopureSyncCursor` before live polling |
| Two writers update overlapping order fields | Medium | Scope Partner updates to fulfillment/tracking/orderShort-only fields initially |
| Rate limits across both APIs | Low/Medium | Batch Partner API with max `limit`, sequence after Twenty backfill, retain Twenty `--delay=700` guidance |

## Recommendation

Adopt the Partner API, but only as a **curated fulfillment/enrichment lane**.

Do next:

1. Add `orderShort`/`partnerOrderShort` to `xopureOrder`.
2. Build a Partner API reader with cursor/watermark persistence.
3. Map `/shipments` to update only existing `xopureOrder` fulfillment fields.
4. Map `/fulfillment-exceptions` to a dashboard/snapshot object or support
   workflow signal.
5. Leave the existing Supabase sync as the canonical broad commerce/raw-data
   sync.

