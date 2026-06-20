# Read-Only Supabase Source Orchestration

**Tracking issue**: [X0-21](https://multica.ai/issue/X0-21)
**Implementation issue**: [X0-22](https://multica.ai/issue/X0-22)
**Last updated**: 2026-06-19

---

## 1. Reader & Post-Read Action

**Reader**: A maintainer operating the read-only Supabase data path for XO Pure
CRM's Supabase-to-Twenty sync pipeline and preparing optional webhook setup.

**Post-read action**: Choose the read-only source path before running a backfill.
The dedicated Postgres DSN remains preferred because it reads sanitized `crm`
views. When that DSN is unavailable and Supabase must not be mutated, the
runtime can use the REST fallback with a Supabase publishable/anon key for
GET-only reads against API-exposed `public` tables. Applying SQL, creating
roles, granting privileges, changing Supabase API schemas, or creating Supabase
database webhooks/triggers writes to Supabase and is not part of the current
no-Supabase-write constraint.

### Terminology: sync-map naming

This document uses `sync map` in two distinct contexts:

| Context | Location | Purpose |
|---|---|---|
| **Supabase public.crm_sync_map table** | Supabase migration `202605070001_create_crm_sync_map.sql` | Supabase-side migration-tracking table with unique constraints, RLS, and index coverage. Tracks which rows have been exported. |
| **Twenty xopureSyncMap object** | `src/supabase-sync/utils/upsert-sync-map.ts` | Twenty-side custom object written by the upsert path for idempotency (tracks `payloadHash` per source row). Not related to the Supabase table of similar name. |

The current runtime idempotency utility (`upsert-sync-map.ts`) operates solely on the
**Twenty-side** `xopureSyncMap` object. The Supabase-side `public.crm_sync_map` table
exists in migration but has no reader or writer in the Twenty worker code.

---

## 2. Current State

### Implemented (Twenty-side sync pieces)

| Piece | Location | Status |
|---|---|---|
| Source table mappings & aliases | `src/supabase-sync/constants/source-table-mapping.ts` | Lists 8 source tables (`profiles`, `customer_expertise`, `affiliates`, `products`, `orders`, `payments`, `order_items`, `commission_ledger`) with target Twenty objects |
| Record mapper | `src/supabase-sync/utils/map-supabase-record.ts` | Maps raw Supabase rows into `MappedSourceRecord` with field values, relations, and content hash |
| Upsert path | `src/supabase-sync/utils/upsert-twenty-record.ts` | Creates or updates Twenty records via GraphQL mutations, driven by mapper output |
| Sync map bookkeeping | `src/supabase-sync/utils/upsert-sync-map.ts` | Idempotency layer: writes to the Twenty-side `xopureSyncMap` object, tracks `payloadHash` per source row, skips unchanged records (separate from Supabase `public.crm_sync_map` migration table) |
| Backfill runner & dependency order | `src/supabase-sync/backfill/backfill-runner.ts` | Orchestrates a dry-run backfill across tables in dependency order. Accepts an injected `readSourceBatch(sourceTable)` parameter used by tests and by the read-only Supabase reader wrapper (products -> profiles -> customer_expertise -> affiliates -> orders -> payments -> order_items -> commission_ledger). |
| Read-only Supabase reader | `src/supabase-sync/backfill/read-supabase-source.ts` | Implements `createSupabaseReader` and `createSupabaseReaderFromEnv` for the preferred `XOPURE_SUPABASE_READONLY_DSN` Postgres path. The reader maps supported source tables to trusted `crm.v_twenty_*` views and paginates with bound limit/offset values. |
| REST fallback reader | `src/supabase-sync/backfill/read-supabase-rest-source.ts` | Supports the no-Supabase-write fallback with `XOPURE_SUPABASE_READONLY_REST_URL`, `XOPURE_SUPABASE_READONLY_REST_KEY`, and optional `XOPURE_SUPABASE_READONLY_REST_SCHEMA`. It uses GET-only PostgREST reads against API-exposed tables and whitelisted columns. |
| Backfill execution wrapper | `src/supabase-sync/backfill/run-xopure-backfill.ts` | Wraps the dry-run runner and adds live-mode upserts through the existing mapper + `upsertTwentyRecord` path. Defaults to dry-run. |
| Local backfill CLI runner | `src/supabase-sync/cli/run-xopure-backfill.ts` | Source-controlled entry point for local no-Supabase-write backfills. It reads env, defaults to dry-run, accepts `--live` and `--source-table=<table>`, and prints summary counts/errors only. |
| Manual backfill action | `src/logic-functions/supabase-backfill-action.action.logic-function.ts` | Wires a Twenty workflow action to the read-only reader and backfill wrapper. The action defaults to dry-run and exposes only summary counts. |
| Scheduled reconciliation lane | `sync:backfill --live`, `src/logic-functions/supabase-reconciliation-schedule.scheduled.logic-function.ts` | Keeps the live backfill path as the required reconciliation safety net. Webhooks are optional acceleration and do not replace this lane. |
| Webhook ingest lane | `src/logic-functions/supabase-webhook-ingest.webhook.logic-function.ts`, `src/logic-functions/handlers/supabase-sync-webhook-handler.ts` | Existing `/xopure/sync/supabase` endpoint validates `x-xopure-sync-secret`, maps accepted Supabase row-change payloads, and upserts into Twenty. Supabase-side webhook configuration has not been applied. |
| Backfill tests | `src/supabase-sync/backfill/backfill-runner.spec.ts` | 3 tests exercising the dry-run pipeline with mocked `readSourceBatch` |
| Unit tests | `src/supabase-sync/supabase-record-mapper.spec.ts`, `upsert-twenty-record.spec.ts` | Cover mapper edge cases and upsert logic |
| Webhook endpoint spec | `docs/XOPURE-CRM-SYNC-SPEC.md` S5 | Defines the POST endpoint for real-time sync events from Supabase |
| Application variables | `src/application-config.ts` | Registers `XOPURE_SYNC_WEBHOOK_SECRET` and `XOPURE_ENRICHMENT_PROVIDER` |
| crm schema & stub views (4 of 8) | Supabase migration `202605190001_create_crm_schema_and_audit.sql` | Creates `crm.v_twenty_ambassadors`, `crm.v_twenty_people` (conditional — only exists if `public.profiles` was present when the migration ran), `crm.v_twenty_orders`, `crm.v_twenty_commissions`, plus audit/activity tables and sync-enqueue function |
| Sync map table (separate concept) | Supabase migration `202605070001_create_crm_sync_map.sql` | Creates `public.crm_sync_map` with unique constraints, RLS, and index coverage. This is a Supabase-side migration table, not the same as the Twenty-side `xopureSyncMap` object written by the upsert path. |
| Sync spec | `docs/XOPURE-CRM-SYNC-SPEC.md` | Full design document covering object definitions, field mappings, idempotency, webhook config, and deferred Phase 2 features |

The mapper/backfill table list includes logical `payments` records so Twenty can
store payment objects. That does not mean an operator should configure a
Supabase `payments` webhook today; webhook setup should use the physical tables
listed in the manual setup section below.

### Runtime outcome on 2026-06-19

Under the current **do not write to Supabase** constraint, the DSN migration path
was not applied. Instead, the sync used the REST fallback with Railway's existing
Supabase publishable key and wrote only to Twenty.

Observed production run:

| Step | Result |
|---|---|
| Supabase REST dry-run | `scanned=5`, `mapped=5`, `failed=0`, all rows were products |
| Twenty app install | `tw3nty deploy ... --remote xopure-prod` then `tw3nty install ... --remote xopure-prod`; metadata showed 14 `xopure*` objects afterward |
| Live Twenty sync | `scanned=5`, `mapped=5`, `created=5`, `failed=0` |
| Idempotency re-run | `scanned=5`, `mapped=5`, `skipped=5`, `failed=0` |
| Source-controlled runner re-run | `yarn sync:backfill` returned `scanned=5`, `mapped=5`, `failed=0`; `yarn sync:backfill --live` returned `skipped=5`, `failed=0` |
| REST verification | `/rest/xopureProducts` returned 5 rows; `/rest/xopureSyncMaps` returned 5 rows |

| **2026-06-19 DSN sync** | Postgres reader wired to `xo_readonly` role via `XOPURE_SUPABASE_READONLY_DSN`. Dry-run: `scanned=683`, `mapped=894`, `failed=0` across all 8 source tables. Live run created 14 records + 5 updates before Twenty production rate limited the remaining 875. Idempotent re-runs will resume. |
| Twenty DSN verification | `xopureAmbassadors=9`, `xopureReferralRelationships=5`, `xopureSyncMaps=21`, `xopureProducts=5` |

No Supabase SQL, role, grant, schema, or data mutation was executed during this
run.

### Missing

| Gap | Detail |
|---|---|
| **Read-only SQL migration not applied** | `supabase/migrations/202606190001_create_crm_readonly_source_views.sql` now defines `crm_readonly` grants and the four missing views, but it still needs to be applied to the target Supabase project and paired with a generated password. |
| **Read-only source credentials not injected** | The `XOPURE_SUPABASE_READONLY_DSN` using the `xo_readonly` role is the preferred credential and is currently set on Railway. The REST fallback URL/key pair remains available as a secondary path. Neither password nor key is committed to source control. |
| **Supabase webhook configuration not applied** | The Twenty-side webhook endpoint exists, but database webhooks/triggers/dashboard configuration in Supabase were not created under the current no-Supabase-write constraint. |
| **Full source coverage confirmed** | The Postgres reader (via `xo_readonly`) scanned 683 rows across products(5), affiliates(215), orders(126), order_items(103), and commission_ledger(108), mapping to 894 Twenty records. `profiles` is not a public table; `customer_expertise` has 0 rows. |

---

## 3. Non-Goals

The following are explicitly **out of scope** for this work:

- **Browser / client-side Supabase access**: All sync runs server-side inside the
  Twenty worker or server process. No read-only credentials leave the backend.
- **Service-role key for normal polling**: The read-only path uses the
  dedicated Postgres DSN when available, or a publishable/anon key for the
  GET-only REST fallback. It never uses the Supabase service-role key.
- **Direct Railway deployment of the reader**: Writes to Railway happen at a
  manual gate (Phase 6). No automated deployment pipeline touches Railway during
  this work.
- **Applying Supabase SQL under the current constraint**: Creating
  `crm_readonly`, granting privileges, exposing `crm` through PostgREST, or
  applying migrations all write to Supabase. Those actions are explicitly not
  performed while the user has constrained this work to no Supabase writes.
- **Twenty writing to Supabase core tables**: Sync is strictly one-directional
  (Supabase to Twenty). Twenty may write to `crm.twenty_activity_log` for
  Phase 2 activity tracking, but never to `public.*` source tables. The existing
  constraint `sync_direction in ('supabase_to_twenty', 'twenty_to_supabase',
  'bidirectional')` in `crm_sync_map` reserves space but `twenty_to_supabase`
  is not active.
- **Full schema parity**: Achieving 1:1 column coverage for every Supabase table
  is a separate effort tracked in `docs/canonical-schema-parity-2026-06-17.md`.
  This doc focuses on making the existing mapped subset readable through a
  secure path.

---

## 4. Target Architecture

```text
                         +------------------------------------------+
                         |             Supabase Postgres             |
                         |                                          |
                         |  public.affiliates                       |
                         |  public.profiles                         |
                         |  public.orders          raw tables       |
                         |  public.products         (immutable      |
                         |  public.commission_ledger  source)       |
                         |  ...                                     |
                         |         |                                 |
                         |         v                                 |
                         |  +---------------------+                  |
                         |  |   crm schema        |  sanitization   |
                         |  |  v_twenty_* views    |  boundary      |
                         |  |  (SELECT only)       |                 |
                         |  +----------+----------+                  |
                         |             |                              |
                         |             | read-only credential        |
                         |             v                              |
                         |  +--------------------------+             |
                         |  | crm_readonly role         |             |
                         |  | GRANT SELECT on views     |             |
                         |  +--------------------------+             |
                         +--------------------+----------------------+
                                              |
                            readSourceBatch() | (Postgres direct preferred,
                                              |  REST fallback for public tables)
                                              v
                         +------------------------------------------+
                         |           Twenty Worker / Server          |
                         |                                          |
                         |  readSourceBatch(table)                  |
                         |         |                                 |
                         |         v                                 |
                         |  map-supabase-record.ts                  |
                         |  (raw record -> MappedSourceRecord       |
                         |   with field values, relations, hash)    |
                         |         |                                 |
                         |         v                                 |
                         |  upsert-twenty-record.ts                 |
                         |  (create/update via GraphQL)             |
                         |         |                                 |
                         |         v                                 |
                         |  upsert-sync-map.ts                      |
                         |  (idempotent Twenty-side sync map entry) |
                         |         |                                 |
                         |         v                                 |
                         |  Twenty xopureSyncMap object             |
                         |  (custom Twenty object, not              |
                         |   Supabase public.crm_sync_map)          |
                         +------------------------------------------+
```

### Flow summary

1. Supabase raw tables (public schema) are the authoritative source of commerce
   data -- orders, affiliates, products, commissions, customer profiles.
2. Sanitized `crm.v_twenty_*` views project only the columns the Twenty-side
   mapper needs. This is the **sanitization boundary**: sensitive columns
   (gateway payloads, calculation traces, auth tokens) are never exposed to the
   sync pipeline.
3. The dedicated read-only Postgres role (`xo_readonly`) provides SELECT access
   to all `public.*` tables. Set `XOPURE_SUPABASE_READONLY_DSN` on the worker.
   If that DSN is not available, the REST fallback uses a publishable/anon key
   for GET-only reads — note the REST fallback cannot see rows hidden behind
   Row Level Security.
4. The Twenty worker calls `readSourceBatch(sourceTable)` -- an injected
   function that queries against the read-only credential and returns raw rows.
5. Rows flow through the existing mapper, upsert path, and sync-map bookkeeping
   to land in Twenty as typed objects.

### Reconciliation plus optional webhook layer

The implemented sync architecture has two lanes:

1. **Scheduled reconciliation safety net**: The scheduled worker path and the
   live backfill command (`sync:backfill --live`) are the authoritative catch-up
   mechanism. They read from Supabase, map records through the shared mapper,
   and upsert into Twenty. This lane remains required even if webhooks are
   enabled, because it catches missed webhook deliveries, retry exhaustion,
   historical rows, and records that changed while the app was unavailable.
2. **Optional low-latency webhook layer**: Supabase table-change webhooks may
   POST individual row-change events to the existing `/xopure/sync/supabase`
   endpoint. The endpoint uses the same shared secret, mapper, and Twenty upsert
   path as the rest of the sync pipeline. It is an acceleration layer only; it
   is not the source of truth and it does not replace scheduled reconciliation.

Supabase remains the source of truth. Neither lane writes back to Supabase
source tables.

### Manual Supabase webhook setup

Creating Supabase database webhooks, triggers, or dashboard webhook
configuration is a Supabase write/configuration change. Those changes were
**not** executed under the current no-Supabase-write constraint. An operator
must perform this section later from the Supabase project dashboard or a
reviewed migration/change process.

When approved, configure table-change webhooks for these physical `public`
tables:

| Physical Supabase table | Webhook purpose |
|---|---|
| `products` | Product catalog updates |
| `profiles` | Person/profile updates |
| `customer_expertise` | Customer expertise/profile enrichment updates |
| `affiliates` | Ambassador and referral-relationship updates |
| `orders` | Order updates and derived payment updates when payment fields are present |
| `order_items` | Order-line updates |
| `commission_ledger` | Commission updates |

Do **not** configure a `payments` webhook unless a real physical Supabase
`payments` table is introduced later. In the current design, `payments` is a
logical sync target derived from order-shaped rows. The physical `orders`
webhook is the source event that can produce both `orders` and `payments`
Twenty mappings when the order payload includes payment fields.

For each webhook:

1. Use HTTP `POST`.
2. Subscribe to row `INSERT` and `UPDATE` events. Leave `DELETE` disabled until
   a future tombstone/delete mapping exists; the current sync path is upsert-only.
3. Point it at the application route path `/xopure/sync/supabase` on the
   deployed Twenty app host. Do not document or commit a real production URL.
4. Include the shared secret header:

   ```text
   x-xopure-sync-secret: <shared-webhook-secret>
   ```

   The value must match the server-side `XOPURE_SYNC_WEBHOOK_SECRET`. Do not
   paste the real secret into docs, tickets, logs, or screenshots.
5. Send the row-change payload as JSON. The handler expects at least `type`,
   `schema`, `table`, and `record`; `old_record` is optional but useful for
   debugging update events and future tombstone/delete support. The `record`
   object should be the Supabase row as stored; do not rename columns in the
   webhook configuration.

Example shape only:

```json
{
  "type": "UPDATE",
  "schema": "public",
  "table": "orders",
  "record": {
    "id": "<order-id>",
    "customer_id": "<customer-id>",
    "affiliate_id": "<affiliate-id>",
    "subtotal_cents": 9900,
    "tax_cents": 1000,
    "total_cents": 12900,
    "currency": "USD",
    "fulfillment_status": "pending",
    "payment_status": "paid",
    "payment_gateway": "stripe",
    "payment_method_code": "card",
    "paid_at": "<paid-at>"
  },
  "old_record": {
    "id": "<order-id>",
    "updated_at": "<previous-updated-at>"
  }
}
```

The example intentionally uses placeholders. It is not a live endpoint, not a
real payload, and not evidence that Supabase webhooks have already been created.

---

## 5. Credential Strategy

### Current state: `xo_readonly` role is live

The existing `xo_readonly` Postgres role (documented in the support console
spec) has SELECT access to all `public.*` tables. Set `XOPURE_SUPABASE_READONLY_DSN`
to a Postgres DSN using the `xo_readonly` credentials:

```text
postgresql://xo_readonly:<password>@db.<project-ref>.supabase.co:6543/postgres
```

The Postgres reader (`read-supabase-source.ts`) reads from `public.*` tables
directly — it does not require the pending `crm.v_twenty_*` views.

This role is **read-only**. It has no INSERT, UPDATE, DELETE, or DDL grants.

The pending migration (`202606190001`) would optionally create sanitized
`crm.v_twenty_*` views and a narrower `crm_readonly` role, but neither is
required for the current sync path.

### Runtime fallback: key-based Supabase REST (public tables only)

If connecting via Postgres protocol is impractical or the `crm_readonly` DSN is
not available, the current no-Supabase-write path can read through Supabase
PostgREST using a publishable/anon key. This fallback is intentionally narrower
than the preferred DSN path:

- It uses server-side `GET` requests only.
- It reads API-exposed `public` tables, not `crm.v_twenty_*` views.
- It whitelists the selected columns for each supported source table.
- It stores the key as a server-side secret, never in client code.
- It must not use `SUPABASE_SERVICE_ROLE_KEY` or any service-role-looking key.

The `crm` schema views are not visible through PostgREST unless the Supabase
project's API schemas are changed. Changing API schemas, applying SQL, creating
roles, or granting privileges mutates Supabase and is outside the user's current
no-Supabase-write constraint.

### Credential lifecycle

| Stage | Procedure |
|---|---|
| **Generation** | The password for `crm_readonly` is generated via `openssl rand -base64 32` (or Supabase dashboard "Reset Password") and used once. |
| **Storage** | Stored in Railway as `XOPURE_SUPABASE_READONLY_DSN` (secret). If the DSN is unavailable, store the REST fallback URL/key pair instead. Never commit credentials to `.env` files, source control, or container images. |
| **Rotation** | Rotate every 90 days. Update the password in Supabase via `ALTER ROLE crm_readonly PASSWORD '<new-password>'`, then update the Railway secret. The service has zero downtime if connection pools drain naturally within the TCP timeout. |
| **Compromise response** | 1. Immediately `ALTER ROLE crm_readonly NOLOGIN;` in Supabase to kill active sessions. 2. Rotate the password. 3. `ALTER ROLE crm_readonly LOGIN;` with the new password. 4. Update Railway secret. 5. Inspect Supabase query logs for any anomalous queries run under the compromised credential. |

The password is the sole gate; there is no second factor for Postgres direct connections.

### Runtime environment variables

| Variable | Value | Secret | Notes |
|---|---|---|---|
| `XOPURE_SUPABASE_READONLY_DSN` | `postgresql://crm_readonly:...` | Yes | Preferred Postgres-direct reader credential |
| `XOPURE_SUPABASE_READONLY_REST_URL` | `https://<ref>.supabase.co` | No | Supabase project URL for the REST fallback; do not include `/rest/v1` |
| `XOPURE_SUPABASE_READONLY_REST_KEY` | `<publishable-or-anon-key>` | Yes | REST fallback key; must not be the service-role key |
| `XOPURE_SUPABASE_READONLY_REST_SCHEMA` | `public` | No | Optional PostgREST schema header value; defaults to `public` |
| `XOPURE_TWENTY_API_URL` or `TWENTY_SERVER_URL` | `https://<twenty-host>` | No | Twenty API base URL used by the local backfill runner |
| `XOPURE_TWENTY_API_KEY` or `TWENTY_API_KEY` | `<twenty-api-key>` | Yes | Twenty API key used by the local backfill runner |

Set `XOPURE_SUPABASE_READONLY_DSN` when the dedicated role exists. If it is
missing, set both REST fallback variables. Do not set the REST key to a
service-role value just to make the fallback work.

The Supabase env checker reports only whether the REST fallback key is present
and its length. It must not print the REST key value. It rejects obvious
service-role-looking values before attempting any REST reachability checks.

### Local backfill runner

Use the source-controlled runner instead of one-off local snippets. It fails
closed unless it has both Twenty credentials and one Supabase source credential
path (`XOPURE_SUPABASE_READONLY_DSN`, or the REST URL/key pair). Dry-run is the
default and does not write to Twenty or Supabase:

```bash
# From packages/twenty-apps/internal/xopure-crm
yarn sync:backfill

# Narrow a dry-run to one source table.
yarn sync:backfill --source-table=products
```

After reviewing the dry-run summary, pass `--live` to write mapped records to
Twenty only:

```bash
# From packages/twenty-apps/internal/xopure-crm
yarn sync:backfill --live
```

The runner prints JSON with `dryRun`, `scanned`, `mapped`, `created`, `updated`,
`skipped`, `failed`, `durationMs`, `tableCount`, and sanitized `errors`. It
intentionally omits mapped record payloads and secret values.

### Environment separation and network access

**Staging vs. production source credentials**: Each environment MUST use its own
Supabase project. Do not share a `crm_readonly` credential or REST fallback key
across Railway staging and production services. Define separate secrets:

| Environment | Variable | Supabase project |
|---|---|---|
| Staging | `XOPURE_SUPABASE_READONLY_DSN`, or REST fallback URL/key | XO Pure staging Supabase |
| Production | `XOPURE_SUPABASE_READONLY_DSN`, or REST fallback URL/key | XO Pure production Supabase |

**Supabase pooler and IP allow-listing**: The Supabase connection pooler
(`*.pooler.supabase.com:6543`) supports session mode and transaction mode.
The reader should use session mode for long-lived connections during backfill.
If Railway egress IPs are stable, configure a Supabase network restriction
that allows only the Railway worker's egress CIDR range. Consult the Railway
dashboard for current egress IPs; they are documented at
`https://docs.railway.app/reference/public-networking#egress-ip`.

If IP allow-listing is not feasible, enforce transport security via
`sslmode=require` in the DSN and accept that the database is reachable from
any network path that can resolve the Supabase project hostname. In that case,
the `crm_readonly` password is the sole network-level control.

---

## 6. Orchestration Phases

### Phase 1 -- Secure Read Layer (Supabase SQL)

**Goal**: Create the `crm_readonly` role, grant SELECT on existing `crm` views,
and fill the view coverage gap for all 8 source tables. This phase writes to
Supabase and is skipped while operating under the current no-Supabase-write
constraint.

**Actions**:

1. Write a new migration (proposed name `{{timestamp}}_create_crm_readonly_role.sql`):
   - Create role `crm_readonly` with LOGIN and a generated password.
   - Grant `USAGE ON SCHEMA crm`.
   - Grant `SELECT` only on the `crm.v_twenty_*` views required by the mapper.
   - Add future view grants in the migration that creates each new view.
2. Write or update migrations to add missing views:
   - `crm.v_twenty_products` -- project columns consumed by `mapProduct()`.
   - `crm.v_twenty_payments` -- project columns consumed by `mapPayment()`.
   - `crm.v_twenty_order_items` -- project columns consumed by `mapOrderItem()`.
   - `crm.v_twenty_customer_expertise` -- project columns consumed by `mapCustomerExpertise()`.
3. Apply migrations to Supabase project.
4. Generate `crm_readonly` DSN and add to Railway staging environment as `XOPURE_SUPABASE_READONLY_DSN`.

**Verification**: Connect with `psql` using the read-only DSN and run
`SELECT count(*) FROM crm.v_twenty_ambassadors;` -- must return data; `INSERT`
into any `crm` table or source table must fail with permission denied.

### Phase 2 -- Source Reader Implementation

**Goal**: Implement the function behind `readSourceBatch` that the backfill
runner expects.

**Actions**:

1. Create `src/supabase-sync/backfill/read-supabase-source.ts`:
   - Export a factory: `createSupabaseReader(dsn: string): BackfillReader`.
   - `createSupabaseReader` accepts the DSN, creates a `pg` pool (max 5 connections),
     and returns a function matching the `BackfillReader` signature:
     `(sourceTable: SupportedSourceTable) => Promise<Array<Record<string, unknown>>>`.
   - Internally: map the table name to its corresponding `crm.v_twenty_*` view name,
     execute `SELECT * FROM crm.v_twenty_{view} ORDER BY updated_at ASC` with
     optional pagination (`LIMIT 1000 OFFSET N`).
   - Handle connection pooling gracefully: the pool is created once when the
     factory is called, shared across all batches, and closed when the process ends.
2. No cryptography, no auth tokens -- the DSN carries the credential.

**Verification**: Unit test that passes the DSN and asserts returned rows match
expected shape for each source table. Integration test against staging Supabase.

### Phase 3 -- Wiring

**Goal**: Wire the real reader and Twenty REST client into the local
`sync:backfill` runner around `runXopureBackfill`.

**Actions**:

1. Use the source-controlled `sync:backfill` CLI runner with `readSourceBatch`
   backed by `createSupabaseReaderFromAnyEnv`.
   Keep `backfill-runner.ts` unchanged -- it accepts the reader as injection;
   the runner entry point is where env, the source reader, and the Twenty client
   meet.
2. The runner reads Twenty URL/key env, prefers
   `XOPURE_SUPABASE_READONLY_DSN`, and falls back to the REST URL/key pair for
   GET-only Supabase reads.
3. It fails closed before constructing clients if either Twenty credentials or
   Supabase source credentials are missing.
4. It prints only summary counts and sanitized errors.

**Verification**: Run `yarn sync:backfill` against staging and review the JSON
summary before any upsert. Do not print mapped records or secret values.

### Phase 4 -- Tests & Dry-Run

**Goal**: Exercise the full pipeline without mutating Twenty, then with a
non-production Twenty workspace.

**Actions**:

1. Extend `backfill-runner.spec.ts` with an integration-style test that uses
   the staging DSN reader, or the REST fallback reader when the DSN is
   unavailable (skip in CI unless env vars are set).
2. Run `yarn sync:backfill` against staging Supabase and staging Twenty.
   Verify the summary counts match the expected source rows.
3. Run `yarn sync:backfill --live` only after the dry-run summary is reviewed,
   then check idempotency by re-running with `--live` and confirming `skipped`
   count matches mapped count.
4. Test error paths: invalid DSN, empty table, network failure. Backfill
   runner reports failures without crashing.

**Verification**: All backfill-runner, mapper, and upsert test suites pass.
Dry run produces expected records without
mutating Twenty. Re-running produces zero upserts.

### Phase 5 -- Pod-Stack Verification

**Goal**: Run the backfill inside a Railway-like container against the staging
Supabase and staging Twenty.

**Actions**:

1. Build the worker Docker image locally.
2. Run with staging environment variables (`XOPURE_SUPABASE_READONLY_DSN`, or
   the REST fallback URL/key pair, plus Twenty API URL and Twenty API key).
3. Execute an on-demand backfill via the worker's command entry point.
4. Inspect logs for errors, rate limiting, or timeout issues.
5. Verify record counts. For the DSN path, query
   `SELECT count(*) FROM crm.v_twenty_{view}` per source table through the
   read-only DSN and compare to
   `SELECT count(*) FROM xopureSyncMap WHERE sourceTable = '{table}'` in Twenty.
   For the REST fallback path, compare the GET-only public-table result counts
   to the same Twenty sync-map counts; do not expect `crm` view counts unless
   Supabase API schemas have been changed. Record the baseline counts in the
   dry-run output. Any mismatch indicates a filtering discrepancy between the
   source projection and the mapper.

**Verification**: Local container run produces clean logs and all Twenty
xopureSyncMap records show status `SYNCED`. No credential leaks in log output.

### Phase 6 -- Manual Railway Gate

**Goal**: Deploy to Railway production with human approval.

**Actions**:

1. Set Railway environment variables for the worker service:
   `XOPURE_SUPABASE_READONLY_DSN` or the REST fallback URL/key pair, plus
   Twenty API URL/key and `XOPURE_SYNC_WEBHOOK_SECRET`.
2. **Manual step**: A human reviews the staging results from Phase 5 and
   approves the Railway deploy.
3. Deploy the worker service to Railway.
4. Trigger the initial backfill on production data.
5. Monitor logs for 24 hours. Watch for: connection pool exhaustion, slow
   queries on Supabase side, Twenty rate limiting.
6. If stable: enable periodic backfill schedule (e.g. cron every 15 min for
   high-churn tables, daily for static data).

**Verification**: Production Twenty xopureSyncMap object fills with rows. No errors in Railway
logs. No CPU/memory spikes on Supabase.

---

## 7. Handoff Checklist

> _Each item is a concrete action, not a TODO placeholder._

- [ ] Read `packages/twenty-apps/internal/xopure-crm/docs/XOPURE-CRM-SYNC-SPEC.md` for the full design contract.
- [ ] Read `docs/supabase-schema-2026-06-17.md` for the complete Supabase column inventory.
- [ ] Read `docs/canonical-schema-parity-2026-06-17.md` for field-level parity status across all 68 Supabase tables.
- [ ] Read `packages/twenty-apps/internal/xopure-crm/src/supabase-sync/utils/map-supabase-record.ts` -- identify exactly which columns each of the 8 mappers consumes (look for `mapProfiles`, `mapCustomerExpertise`, `mapAffiliates`, `mapProducts`, `mapOrders`, `mapPayments`, `mapOrderItems`, `mapCommissionLedger`, and their relation helpers).
- [ ] For the DSN path only, create migration `{{timestamp}}_create_crm_readonly_role.sql` with `crm_readonly` role + grants.
- [ ] For the DSN path only, create/update migrations for each missing `crm.v_twenty_*` view: products, payments, order_items, customer_expertise.
- [ ] If allowed to write to Supabase, apply migrations to the XO Pure Supabase project (run `./scripts/xopure/apply-supabase-sql.sh` or apply via Supabase dashboard). Do not do this under the current no-Supabase-write constraint.
- [ ] Generate DSN for `crm_readonly` role and store it in Railway staging as `XOPURE_SUPABASE_READONLY_DSN`, or configure the REST fallback URL/key pair when the DSN is unavailable.
- [ ] Create `src/supabase-sync/backfill/read-supabase-source.ts` implementing the `readSourceBatch` contract.
- [ ] Wire the reader into the source-controlled `sync:backfill` CLI runner.
- [ ] Run `yarn sync:backfill` against staging to verify summary counts.
- [ ] Run `yarn sync:backfill --live` against staging Twenty to verify upsert works.
- [ ] Re-run to confirm idempotency (all results are `skipped`).
- [ ] Run the relevant package tests before any deployment gate.
- [ ] Container build and run for pod-stack verification (Phase 5).
- [ ] Human approval gate: show Phase 5 results to a teammate, get sign-off.
- [ ] Set Railway prod env vars and deploy worker.
- [ ] If approved to change Supabase configuration, create webhooks for `products`, `profiles`, `customer_expertise`, `affiliates`, `orders`, `order_items`, and `commission_ledger`. Do not create a `payments` webhook unless a separate physical payments source is intentionally added.
- [ ] Monitor for 24 hours post-deploy.

---

## 8. Known Current Gaps

| Gap | Severity | Details |
|---|---|---|
| **Read-only migration not applied** | **blocking for DSN path** | The migration exists in source control, but the target Supabase project still needs the `crm_readonly` role, per-view grants, and generated password applied before the Postgres reader can connect. Applying it writes to Supabase and is not done under the current no-write constraint. |
| **Runtime source credential not set** | **blocking** | `XOPURE_SUPABASE_READONLY_DSN` should be added to the worker/action runtime as a secret. If it is unavailable, configure `XOPURE_SUPABASE_READONLY_REST_URL` and `XOPURE_SUPABASE_READONLY_REST_KEY` instead. The code intentionally fails closed when neither credential path is present. |
| **REST cannot read crm views by default** | **medium** | The REST fallback reads exposed `public` tables with whitelisted columns. Existing `crm.v_twenty_*` views are not available through PostgREST unless Supabase API schemas are changed, which would be a Supabase write/configuration change. |
| **Only products synced in the no-write run** | **medium** | The 2026-06-19 REST dry-run found and synced 5 products. The other exposed public source tables returned zero rows, and `profiles` is not exposed through PostgREST. Full coverage still requires data in those tables or the preferred `crm` views through the DSN path. |
| **Supabase webhooks not configured** | **low** | The Twenty-side webhook endpoint is ready for future low-latency events, but creating Supabase DB webhooks/triggers is a Supabase write/configuration change and was not executed under the current constraint. Scheduled reconciliation remains the safety net. |
| **Railway deployment gate unexercised** | **low** | The manual Railway gate (Phase 6) has never been run for the sync pipeline. Dockerfile, railway.toml, and env setup are untested for the reader path. |
