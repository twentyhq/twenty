# Orbitor on Supabase — Ship-Ready Design

> **Date:** 2026-06-19
> **Status:** approved design → implementation
> **Builds on:** `2026-06-19-supabase-migration-local-verification.md` (that migration is DONE and verified E2E).

## 1. Goal / Definition of Done

A maintainer sets environment variables, runs `docker compose up`, and gets a **clean, fast, smooth Orbitor running on Supabase**, behaving identically to upstream Twenty:

- **Deployment-ready:** one compose file + an `.env` template; no code edits needed to deploy — just set env and run.
- **Fast workspace activation:** seconds, not minutes.
- **Smooth, stock UI:** Twenty's native design/animations, untouched, running as the optimized production build (no dev-server roughness).
- **Clean start:** new workspaces have no demo/sample data.
- **Reference parity:** every core flow (sign-in, add/edit/delete records, navigation, search, files, workflows) works exactly as in upstream Twenty.
- **No errors:** zero console/server errors in normal use.

**Explicitly NOT in scope:** actually hosting/deploying (DNS, TLS termination, cloud provider), CDN, managed Redis. The output is *deployment-ready artifacts + a verified local prod run*, not a live deployment.

## 2. Crucial context (read first)

- **Orbitor `main` is upstream Twenty.** Commit history is pure twentyhq/twenty. There is **no custom Orbitor code**. Therefore the app shares 100% of Twenty's behavior — "reference parity" is inherent, and observed breakage is **environmental**, not code we changed.
- **The only code changes** are 2 additive, backward-compatible backend files on branch `feat/supabase-local-compat` (commit 40e2cc4188): core pg-pool cap (`PG_POOL_MAX_CONNECTIONS`) and `setup-db.ts` provisioning of `public.uuid_generate_v4()` + unaccent-in-public for Supabase.
- **What was actually disturbed during migration/debugging (the real "breakage" suspects):**
  1. The local Chrome browser's site data for `localhost:3001` was cleared (IndexedDB/Service Worker/localStorage/cookies), which left that browser tab in a **hung/blank state** — this is the most likely cause of "buttons don't work / app not working" when viewed in that browser.
  2. The app was exercised against the **Vite dev build** (inherently rough vs. the production build).
  3. Twenty's **seeded demo workflow** ("Create company when adding a new person") generated blank "Untitled" companies (now cleaned + deactivated).
- **Supabase:** project ref `edwnmccxwojehammlbdy`, region `ap-northeast-1` (Tokyo), PG 17.6, session pooler (`:5432`, pool_size **15**), private bucket `orbitor-files`. Activation slowness = server↔DB round-trips (~300ms each from a distant client) × hundreds of metadata writes.
- **Twenty ships production Docker assets:** `packages/twenty-docker/docker-compose.yml` (server + worker + redis + a bundled `db`), `twenty/Dockerfile` (multi-stage; the `twenty` target's server image **serves the built static frontend** itself — no separate front service), and `.env.example`. We adapt these.

## 3. Workstreams

### A. Deployment packaging (docker-compose for Supabase)
Adapt Twenty's prod compose into a Supabase-targeted one (e.g. `docker-compose.supabase.yml`):
- **Build our image from this repo** (Dockerfile target `twenty`) so the 2 compat fixes are baked in — instead of pulling `twentycrm/twenty:latest`.
- **Remove the bundled `db`** service; set `PG_DATABASE_URL` to the full Supabase **session-pooler** URL; pass `PG_POOL_MAX_CONNECTIONS` and `PG_SSL_ALLOW_SELF_SIGNED` as needed.
- **Add the missing `STORAGE_S3_ACCESS_KEY_ID` / `STORAGE_S3_SECRET_ACCESS_KEY`** to both `server` and `worker` env (the stock compose omits them; Supabase S3 requires explicit keys).
- **Keep the local `redis`** service. Use `ENCRYPTION_KEY` (current Twenty standard).
- **First-run DB init:** ensure `database:init`/migrations run against Supabase on first boot (the `setup-db` fix makes this Supabase-safe). Confirm the image entrypoint does this or add an explicit one-time init step.
- Ship **`.env.supabase.example`** + a concise **deploy README** = the "set env and run" surface.

### B. Fast workspace activation (seconds) — co-location
The fix is **co-location**: run server+worker in Supabase's region so per-DDL round-trips drop from ~300ms to ~1ms → activation completes in seconds automatically. Capture this as a **documented deploy requirement** (deploy in `ap-northeast-1`, or move the Supabase project to the chosen deploy region). **Batching the migration-runner metadata writes is deferred** (optional follow-up only if co-located activation is still too slow).

### C. Smooth UI — stock production build, ZERO design changes
Smoothness comes **only** from running Twenty's stock production build (the prod image serves the optimized static frontend, not the Vite dev server). **No changes to `twenty-front`, CSS, or animations** — Twenty's native design is preserved exactly. Verify the prod build renders with smooth animations and **zero console errors** (the pool fix already removed the EMAXCONNSESSION errors).

### D. Clean start — disable demo/sample seed data
Gate Twenty's onboarding demo prefill (`DevSeeder` / `StandardObjectsPrefillModule`, invoked during workspace activation) so **new workspaces start empty** — no sample companies/people and no sample workflows (incl. the "create company on person upsert" one). Use the least-invasive mechanism: an env/config flag if one exists, otherwise a small gated change in the activation path. Must not affect the metadata/standard-objects schema setup — only the demo *records/workflows*.

### E. Reference-parity audit & breakage resolution (first implementation phase)
Because the code equals upstream Twenty, this is mostly **verification + environment repair**, not code surgery:
1. **Repair the corrupted local browser state** I introduced: fully clear `localhost:3001` site data (or use a fresh browser profile / the prod build) so the app loads cleanly — this addresses "add-company button / things don't work."
2. **Audit core flows against the Twenty reference** in a clean environment (clean browser + ideally the prod build): sign-in, add/edit/delete Company + Person (incl. inline cell editing and the record side-panel editors), navigation between objects, search, file upload, settings. For each, confirm it behaves as upstream Twenty does.
3. **Fix only genuine divergences.** Since `main` is upstream Twenty, a flow that "fails identically to reference Twenty" is *as-designed*, not a bug; only behavior that differs from reference (i.e., something our 2 backend files or env actually broke) gets fixed. Expectation: none, because the changes are additive backend-only.
4. Record findings (works / environmental / real-bug-fixed) so "what was broken" is unambiguous.

### F. End-to-end verification on the prod stack
Build the image, `docker compose up` against Supabase (co-located), and confirm the full DoD: seconds-fast activation, empty clean workspace, smooth stock UI, zero errors, and a complete E2E pass (sign-in → record CRUD → file upload → worker job), all matching reference Twenty.

## 4. Risks & prerequisites
- **Docker daemon must be running** locally to build/run the image (it was stopped during verification). Prereq for A/C/F; packaging files (A) can be authored without it.
- **Front build is memory-heavy** (`NODE_OPTIONS=--max-old-space-size`); the Dockerfile already supports a pre-built front to skip it.
- **Co-location** is the activation-speed lever; without it (e.g., testing the prod image locally from a distant client) activation is still slow — that's expected and not a code defect.
- **Encryption key vs APP_SECRET:** use `ENCRYPTION_KEY` for new deploys; document rotation fields.

## 5. Execution order
**E (clean + reference-parity audit) → D (disable demo data) → A (Supabase compose + env template + docs) → C (prod build) → F (full prod-stack verification).** B is a documented deploy requirement (no build work). Batching is deferred.
