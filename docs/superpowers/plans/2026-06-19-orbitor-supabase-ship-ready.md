# Orbitor on Supabase — Ship-Ready Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make Orbitor (upstream Twenty) deployment-ready on Supabase — `set env → docker compose up` yields a clean, fast, smooth instance behaving identically to reference Twenty.

**Architecture:** Orbitor's code *is* upstream Twenty (no divergence). Work is: (1) prove/restore correct behavior in a clean environment, (2) one small config flag to skip demo data, (3) a Supabase-targeted docker-compose + env template + docs, (4) build/run the stock production image and verify. Speed comes from co-locating server+DB; UI smoothness from the stock production build. No `twenty-front`/design/animation changes.

**Tech Stack:** NestJS + TypeORM (twenty-server), React/Vite static build (twenty-front), PostgreSQL 17 (Supabase session pooler), local Redis, Docker Compose.

## Global Constraints
- **Do NOT modify `twenty-front`, CSS, or animations.** UI smoothness comes only from the stock production build.
- **Only additive/backward-compatible backend changes**, gated by env so default (non-Supabase) behavior is unchanged.
- Branch: `feat/supabase-local-compat`. Commit per task.
- Supabase: ref `edwnmccxwojehammlbdy`, session pooler `:5432` (pool_size 15), bucket `orbitor-files`, region ap-northeast-1.
- Verify DB state via the **Supabase MCP** (the Postgres MCP points at stale local DB).

---

### Task 1: Reference-parity audit & local browser repair

**Goal:** Establish that the app works correctly (matching reference Twenty) once the environment is clean — resolving the "buttons/things don't work" reports, which trace to the browser site-data I cleared during debugging + the dev build.

**Files:** none (verification + environment).

- [ ] **Step 1:** In a CLEAN browser context (fresh Playwright context, or a Chrome profile with `localhost:3001` site-data fully cleared), load the app and confirm `#root` mounts with **0 console errors**.
- [ ] **Step 2:** Audit each core flow and record result (works / environmental / real-bug): sign-in; add Company (button → draft → name it → persists); inline-edit a cell; open record side panel + edit a field; add Person; delete a record; navigate Companies/People/Opportunities/Settings; search; file upload. Capture a screenshot of add-Company working.
- [ ] **Step 3:** For any flow that fails, compare to reference Twenty (same code) — if it fails identically in reference, it is as-designed; only fix behavior that differs because of our 2 backend changes or env (none expected).
- [ ] **Step 4:** Write the findings into `docs/superpowers/plans/2026-06-19-reference-parity-findings.md` (one line per flow). Commit.

**Deliverable:** documented proof of which flows work, and that "breakage" was environmental (or a concrete bug list if any real divergence is found).

---

### Task 2: Config flag to skip demo/sample data on workspace creation

**Goal:** New workspaces start empty (no sample companies/people/workflows), keeping standard-object metadata intact.

**Files:**
- Modify: `packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts` (add the flag)
- Modify: the activation/seed caller that invokes the demo **data** seed (`engine/workspace-manager/dev-seeder/services/dev-seeder.service.ts` data-seed path at line ~187, and/or its caller in the workspace-activation flow — confirm exact caller by tracing `activateWorkspace` → seed)
- Test: `packages/twenty-server/src/engine/workspace-manager/dev-seeder/services/__tests__/dev-seeder.service.spec.ts` (or nearest existing spec)

**Interfaces:**
- Produces: config var `IS_WORKSPACE_DEMO_DATA_ENABLED` (boolean, default `true` for parity). When `false`, the demo **data** seed (sample records + sample workflows) is skipped; metadata seeding still runs.

- [ ] **Step 1:** Trace the activation→seed path: confirm exactly which service/method seeds demo *records/workflows* (vs metadata). Run: `grep -rn "activateWorkspace" packages/twenty-server/src/engine/core-modules/workspace` then follow to the seed call.
- [ ] **Step 2:** Add `IS_WORKSPACE_DEMO_DATA_ENABLED = true;` to `config-variables.ts` following the existing `IS_*` boolean pattern (e.g. near `IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS`), with the metadata decorator used by neighbors.
- [ ] **Step 3:** Write a failing unit test asserting the demo-data seed is NOT called when the flag is `false` (mock the data-seeder; spy on its `seed`).
- [ ] **Step 4:** Run the test, verify it fails. Run: `cd packages/twenty-server && npx jest dev-seeder.service -t "demo data"`
- [ ] **Step 5:** Gate the demo-data seed call behind `twentyConfigService.get('IS_WORKSPACE_DEMO_DATA_ENABLED')`.
- [ ] **Step 6:** Run the test, verify it passes; run typecheck `npx nx typecheck twenty-server`.
- [ ] **Step 7:** Commit: `feat(server): add IS_WORKSPACE_DEMO_DATA_ENABLED to skip demo data on workspace creation`.

**Deliverable:** with `IS_WORKSPACE_DEMO_DATA_ENABLED=false`, a freshly created workspace has 0 sample records and 0 sample workflows.

---

### Task 3: Supabase docker-compose + env template + deploy README

**Goal:** `set env → docker compose up` artifacts, adapting Twenty's prod compose for Supabase.

**Files:**
- Create: `packages/twenty-docker/docker-compose.supabase.yml`
- Create: `packages/twenty-docker/.env.supabase.example`
- Create: `packages/twenty-docker/SUPABASE_DEPLOY.md`

- [ ] **Step 1:** Create `docker-compose.supabase.yml` from `docker-compose.yml` with: `server` and `worker` using `build: { context: ../.., dockerfile: packages/twenty-docker/twenty/Dockerfile, target: twenty }` (bakes in our fixes) instead of the `twentycrm/twenty` image; **remove the `db` service** and its `depends_on`; set `PG_DATABASE_URL: ${PG_DATABASE_URL}` (full Supabase pooler URL); add `PG_POOL_MAX_CONNECTIONS: ${PG_POOL_MAX_CONNECTIONS:-3}`, `PG_SSL_ALLOW_SELF_SIGNED: ${PG_SSL_ALLOW_SELF_SIGNED:-true}`; add `STORAGE_S3_ACCESS_KEY_ID: ${STORAGE_S3_ACCESS_KEY_ID}` and `STORAGE_S3_SECRET_ACCESS_KEY: ${STORAGE_S3_SECRET_ACCESS_KEY}` to BOTH server and worker; add `IS_WORKSPACE_DEMO_DATA_ENABLED: ${IS_WORKSPACE_DEMO_DATA_ENABLED:-false}`; keep `redis`.
- [ ] **Step 2:** Create `.env.supabase.example` with every required var + comments: `PG_DATABASE_URL`, `PG_POOL_MAX_CONNECTIONS=3`, `STORAGE_TYPE=s3`, `STORAGE_S3_NAME`, `STORAGE_S3_ENDPOINT`, `STORAGE_S3_REGION`, `STORAGE_S3_ACCESS_KEY_ID`, `STORAGE_S3_SECRET_ACCESS_KEY`, `REDIS_URL=redis://redis:6379`, `SERVER_URL`, `ENCRYPTION_KEY` (note: `openssl rand -base64 32`), `IS_WORKSPACE_DEMO_DATA_ENABLED=false`.
- [ ] **Step 3:** Validate compose parses: `docker compose -f packages/twenty-docker/docker-compose.supabase.yml --env-file packages/twenty-docker/.env.supabase.example config` (requires Docker CLI). Expected: valid resolved config, no `db` service, S3 keys present on server+worker.
- [ ] **Step 4:** Write `SUPABASE_DEPLOY.md`: prerequisites, the env vars, **co-location requirement** (deploy server in Supabase's region — Task 5), `docker compose -f docker-compose.supabase.yml up`, and the one-time DB init note.
- [ ] **Step 5:** Commit: `feat(docker): Supabase-targeted compose + env template + deploy guide`.

**Deliverable:** compose + env + docs that need only real secret values to run.

---

### Task 4: Build the production image, run on Supabase, verify (requires Docker daemon)

**Goal:** Prove the production stack works end-to-end on Supabase.

> **Prerequisite:** Docker daemon running. The Twenty front build is memory-heavy; pre-build with `npx nx build twenty-front` to let the Dockerfile reuse it.

- [ ] **Step 1:** Build: `docker build --target twenty -t orbitor:supabase -f packages/twenty-docker/twenty/Dockerfile .` (update the compose `build` or `image: orbitor:supabase`). Expected: image builds.
- [ ] **Step 2:** First-run DB init against Supabase (idempotent; applies the uuid/unaccent setup-db fix): run the image's `database:migrate`/init per entrypoint, or `docker compose ... run --rm server yarn ... database:migrate:prod`. Verify via Supabase MCP that `core` + extensions exist.
- [ ] **Step 3:** `docker compose -f packages/twenty-docker/docker-compose.supabase.yml --env-file <your .env> up -d`. Wait for `server` healthcheck green.
- [ ] **Step 4:** Open the app (served by the server on `SERVER_URL`), sign in, create a workspace; with `IS_WORKSPACE_DEMO_DATA_ENABLED=false` confirm the workspace is **empty** and **activation completes in seconds** (co-located) — confirm via Supabase MCP (`activationStatus=ACTIVE`, workspace schema present) and server logs.
- [ ] **Step 5:** E2E on the prod build: add/edit/delete Company + Person (persist via Supabase MCP), file upload (object in `orbitor-files` + renders), trigger a worker job; confirm **0 console errors** and smooth stock UI.
- [ ] **Step 6:** Commit any compose/image fixes found during the run.

**Deliverable:** a verified local production run on Supabase meeting the full DoD.

---

### Task 5: Co-location requirement (documentation)

**Goal:** Make the activation-speed requirement explicit so deployers get seconds-fast activation.

**Files:** Modify `packages/twenty-docker/SUPABASE_DEPLOY.md`.

- [ ] **Step 1:** Add a "Performance / region" section: deploy server+worker in the **same region as the Supabase project** (ap-northeast-1, or move the Supabase project to your deploy region). Explain: workspace activation runs hundreds of metadata round-trips; co-located ≈ seconds, cross-region ≈ minutes. Note batching is a deferred optional optimization.
- [ ] **Step 2:** Commit: `docs(docker): document Supabase co-location requirement for fast activation`.

**Deliverable:** deployers know to co-locate; no code work needed.

---

## Self-Review notes
- Spec coverage: A→Task 3/5, B→Task 5, C→Task 4 (prod build), D→Task 2, E→Task 1, F→Task 4. All covered.
- Docker-dependent steps (Task 4, Task 3 step 3) are flagged with the daemon prerequisite.
- The only code change is Task 2 (env-gated, default-on for parity) — respects "no UI/design changes" and "additive only".
