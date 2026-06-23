# Supabase Migration & Local Verification — Orbitor

> **Self-contained spec.** Everything needed to execute is in this document — it assumes **no prior conversation**.
> **Date:** 2026-06-19
> **Scope:** Move all persistent state to Supabase and run a **local build** of the app against it, verifying everything works end-to-end.
> **OUT OF SCOPE (do not touch):** deployment, hosting, production packaging, Cloudflare, managed Redis. Those are a *separate future effort*. This plan ends when the app runs locally on Supabase and the verification gate passes.

---

## 0. Context for a fresh session (read first)

- **Project:** Orbitor, a CRM built on **Twenty** (open-source). Repo root: `/Users/user/Documents/orbitor`. Nx monorepo, Yarn 4.
- **Runtime pieces:**
  - `twenty-server` — NestJS API (`:3000`). Runs TypeORM migrations on boot.
  - `twenty-worker` — BullMQ background-job consumer (same codebase).
  - `twenty-front` — React/Vite UI (`:3001`).
- **Backing services the app needs:** PostgreSQL, **Redis** (cache + sessions + job queue), and object storage (local disk or S3-compatible).
- **What this plan does:** point Postgres and object storage at **Supabase (cloud)**, run Redis **locally**, run a **local build** of the three app pieces, and prove the whole thing works. When we ship later (separate effort), the data layer is already cloud-hosted and proven, so nothing has to move.
- **Auth note:** the app has its **own** multi-tenant, workspace-scoped auth (JWT, per-workspace Postgres schemas, roles/permissions). Its data lives in Postgres → so it's "in Supabase" automatically. We are **NOT** adopting Supabase Auth (that would be a rewrite of a core subsystem with no benefit). No auth work is required.
- **Tooling available:** the **Supabase MCP** is connected (can read project metadata, run SQL, apply migrations). A read-only **Postgres MCP** is configured in `.mcp.json` and sources `packages/twenty-server/.env` for `PG_DATABASE_URL` — so it now points at Supabase.

---

## 1. Architecture (target state)

```
        ┌────────────────── LOCAL MACHINE ──────────────────┐
        │  twenty-server (NestJS :3000)                      │
        │  twenty-worker  (BullMQ consumer)                  │        ┌──────────── SUPABASE (cloud) ────────────┐
        │  twenty-front   (Vite :3001)                       │ ─────▶ │  Postgres 17  (core / metadata /          │
        │                                                    │        │               workspace_* schemas —      │
        │  Redis (local Docker) ◀── sessions/cache/queue     │        │               ALL data incl. auth)       │
        └────────────────────────────────────────────────────┘        │  Storage (S3) bucket: orbitor-files       │
                                                                       └───────────────────────────────────────────┘
```

- **Postgres → Supabase.** All app data, incl. built-in auth (users/workspaces/permissions/tokens) in `core` + per-workspace schemas.
- **File storage → Supabase Storage** (S3-compatible, bucket `orbitor-files`).
- **Redis → local** (`docker run … redis`). Supabase does not provide Redis; this is the one backing service that stays local. (A managed Redis is a *later, separate* concern — ignore it here.)

---

## 2. Supabase project facts

| Field | Value |
|---|---|
| Project name | `orbitor` |
| Project ref / id | `edwnmccxwojehammlbdy` |
| Region | `ap-northeast-1` (Tokyo) |
| Postgres | **17.6** (note: app's Docker baseline is PG16 — verify on 17 in Phase 4) |
| API/Storage base URL | `https://edwnmccxwojehammlbdy.supabase.co` |
| DB host (pooler) | `aws-1-ap-northeast-1.pooler.supabase.com` |
| DB connection mode | **Session pooler, port 5432** (NOT transaction pooler :6543) |
| DB name | `postgres` (the app namespaces by schema, not database) |
| Storage S3 endpoint | `https://edwnmccxwojehammlbdy.supabase.co/storage/v1/s3` |
| Storage bucket | `orbitor-files` (private) |
| Extensions | `uuid-ossp` installed; `unaccent` available |

---

## 3. What is ALREADY DONE & verified (do not redo)

> All of this was completed and **tested live** in a prior session. A fresh agent should trust it and move to Phase 0/1, not re-verify credentials.

- ✅ **Supabase project `orbitor`** confirmed healthy and empty (no tables/migrations).
- ✅ **Database connection verified** — Session Pooler, `SELECT 1` returned PostgreSQL 17.6.
- ✅ **Storage verified** — full put → get → list → delete round-trip against `orbitor-files` succeeded (path-style; the app's S3 driver already hardcodes `forcePathStyle: true`).
- ✅ **`APP_SECRET` generated** (strong 32-byte random) and set.
- ✅ **Env staged** in `packages/twenty-server/.env` (gitignored, never committed). **The real credential values are in that file — read it from disk.** Masked here:

```
PG_DATABASE_URL=postgresql://postgres.edwnmccxwojehammlbdy:<password>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
STORAGE_TYPE=s3
STORAGE_S3_NAME=orbitor-files
STORAGE_S3_ENDPOINT=https://edwnmccxwojehammlbdy.supabase.co/storage/v1/s3
STORAGE_S3_REGION=ap-northeast-1
STORAGE_S3_ACCESS_KEY_ID=<key id>
STORAGE_S3_SECRET_ACCESS_KEY=<secret>
REDIS_URL=redis://localhost:6379
APP_SECRET=<generated>
```
(The previous local `PG_DATABASE_URL` is kept as a commented backup line in the same file.)

**Still pending (this plan):** bring up local Redis, run DB init, boot the stack, run the verification gate.

---

## 4. Key technical facts & gotchas (must respect)

1. **Session pooler, NOT transaction pooler.** Port **5432**. The app creates a Postgres schema per workspace and relies on session-level features (`SET search_path`, prepared statements); transaction-mode pooling (:6543) silently breaks these. ✅ already on the correct host.
2. **DB name is `postgres`,** not `default`. ✅ reflected in the staged URL.
3. **`database:init:prod` is non-destructive.** `packages/twenty-server/src/database/scripts/setup-db.ts` only runs `CREATE SCHEMA IF NOT EXISTS` (`public`, `core`) and `CREATE EXTENSION IF NOT EXISTS` (`uuid-ossp`, `unaccent`) + an immutable `unaccent_immutable` wrapper. It drops nothing — safe on Supabase.
4. **⚠️ `unaccent` install-schema gotcha (most likely first failure).** `setup-db.ts` runs `CREATE EXTENSION IF NOT EXISTS "unaccent"` (no schema) then defines `unaccent_immutable` referencing `public.unaccent(...)` and `'public.unaccent'::regdictionary`. Supabase tends to place extensions in the `extensions` schema. **If init errors on the wrapper:** create the extension explicitly in `public` (`CREATE EXTENSION unaccent SCHEMA public;`) or adjust the wrapper's schema reference.
5. **TypeORM table migrations run on server boot** (unless `DISABLE_DB_MIGRATIONS=true`). So: `init:prod` (schemas/extensions) → **start the server** (creates `core`/`metadata` tables) → start the worker.
6. **NEVER run a destructive DB reset against this project.** Supabase owns `auth`, `storage`, `realtime`, `vault` schemas. Use only the additive `init` path. Do not point any reset/drop-schema tooling at `orbitor`.
7. **SSL.** The session pooler accepted a TLS connection in testing. If the app errors on the certificate at boot, set `PG_SSL_ALLOW_SELF_SIGNED=true` (already present, commented, in `.env`).
8. **Storage path-style** is already correct (`file-storage-driver.factory.ts` → `forcePathStyle: true`). ✅
9. **Presigned URLs.** S3 driver has an optional presigned mode (`STORAGE_S3_PRESIGNED_URL_ENABLED` / `_BASE`), default off → files served via the app's file-token endpoint. **Verify uploaded files actually render in the UI** (Phase 2).
10. **PG17 vs PG16 baseline** — exercise explicitly in the Phase 4 gate, don't assume.
11. **Direct connection is IPv6-only** (`db.<ref>.supabase.co` has no A record) → use the pooler (IPv4). ✅ already chosen.

---

## 5. Phased Plan (each phase has an acceptance gate)

### Phase 0 — Preflight
- [ ] Bring up **local Redis**: `docker run -d --name orbitor-redis -p 6379:6379 redis` (confirm `redis-cli ping` → `PONG`).
- [ ] Confirm `packages/twenty-server/.env` is complete and has no placeholder secrets (read it).
- [ ] Build prerequisite if needed: `npx nx build twenty-shared`.

**Gate:** Redis reachable on `localhost:6379`; env complete.

### Phase 1 — Database on Supabase
1. `npx nx run twenty-server:database:init:prod` — creates `public`/`core` schemas + `uuid-ossp`/`unaccent` + `unaccent_immutable`, then runs instance commands.
2. **Resolve the `unaccent` checkpoint (Gotcha #4)** if init errors.
3. `npx nx start twenty-server` — boots and runs TypeORM migrations (creates `core`/`metadata` tables). Watch for clean `/healthz`.
4. Verify via the Postgres MCP (or `psql`) that `core` and `metadata` schemas now contain tables (spot-check `core.user`, `core.workspace`).

**Gate:** `init:prod` clean; server boots, migrations run, `/healthz` OK; `core` + `metadata` populated; no Supabase system schema touched.

### Phase 2 — Storage on Supabase
1. Storage env already set & verified.
2. With the server running, do a **real app upload** (workspace/user avatar, or attach a file to a record).
3. Confirm the object lands in `orbitor-files` **and** the file loads back in the UI (Gotcha #9).

**Gate:** upload via the app succeeds, object present in bucket, file renders/downloads in UI.

### Phase 3 — Redis & Worker
1. `npx nx run twenty-server:worker`.
2. Trigger background work (workflow / import / email in LOGGER mode) and confirm the worker consumes a job.

**Gate:** worker connects to Redis, completes ≥1 job; login session persists across requests.

### Phase 4 — Full Local Verification Gate ("everything is right")
Boot the full stack against Supabase:
```bash
npx nx start twenty-server      # API :3000 (runs migrations)
npx nx run twenty-server:worker # background jobs
npx nx start twenty-front       # UI :3001
```
Core checklist:
- [ ] `/healthz` green; server connected to Supabase via pooler.
- [ ] **Sign-in works** — "Continue with Email" with prefilled credentials (`SIGN_IN_PREFILLED=true`).
- [ ] **Workspace** exists/creates (per-workspace schema appears in Postgres).
- [ ] **Record CRUD** — create/edit/delete a Company and a Person; rows persist in the right workspace schema (check via Postgres MCP).
- [ ] **Worker job** runs to completion.
- [ ] **File upload** round-trips through Supabase Storage and renders in the UI.

Optional/extended (only if in scope; each needs external creds): email (SMTP), Google/Microsoft OAuth, AI providers, analytics (ClickHouse).

**Gate:** every **core** item passes. Extended items pass or are explicitly deferred. ← **This is the definition of done for this plan.**

---

## 6. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `unaccent` lands in `extensions`, breaks `unaccent_immutable` | Medium | Gotcha #4 — create in `public` or fix wrapper; caught at Phase 1 |
| App doesn't negotiate SSL to pooler | Low–Med | `PG_SSL_ALLOW_SELF_SIGNED=true` (staged, commented) |
| Transaction-pooler misconfig breaks per-workspace schemas | Low (avoided) | Locked to session pooler :5432 |
| PG17 vs PG16 incompatibility | Low | Exercised in Phase 4 gate |
| Presigned-URL serving misbehaves through Supabase | Low–Med | Phase 2 verifies real UI file load |
| Accidental destructive reset harms Supabase system schemas | Low | Policy: additive `init` only; never reset this project |

---

## 7. Command Reference

```bash
# Local Redis
docker run -d --name orbitor-redis -p 6379:6379 redis
redis-cli ping            # -> PONG

# DB setup (additive, safe on Supabase)
npx nx run twenty-server:database:init:prod

# Run the stack against Supabase
npx nx start twenty-server          # API :3000 (runs migrations on boot)
npx nx run twenty-server:worker     # background worker
npx nx start twenty-front           # UI :3001

# Useful
npx nx build twenty-shared          # prerequisite for server/front builds
npx nx typecheck twenty-server
```

---

## 8. Execution order (one line)

**Phase 0 (Redis) → Phase 1 (`init:prod` + boot → migrations) → Phase 2 (storage round-trip) → Phase 3 (worker job) → Phase 4 (full E2E gate).** Done when the Phase 4 core checklist passes. No deployment, no Cloudflare.
