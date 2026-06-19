# Deploying Orbitor on Supabase

Orbitor is upstream Twenty with Postgres + object storage on **Supabase** and Redis running locally in the compose stack. This is a **set-env-and-run** deployment: the server container initializes the database itself on first boot.

> **Performance requirement (read this first):** Deploy the server + worker in the **same cloud region as your Supabase project.** Workspace creation runs hundreds of small DDL/metadata round-trips; co-located it finishes in **seconds**, but from a distant host it can take **minutes**. If your deploy region differs from the Supabase region, create the Supabase project in your deploy region (or move it) rather than working around it. (A migration-runner batching optimization is a possible future change but is not required when co-located.)

## Prerequisites
- Docker + Docker Compose, on a host **in your Supabase project's region**.
- A Supabase project with:
  - **Session pooler** connection string (Dashboard → Connect → *Session pooler*, port **5432**, db `postgres`). Do **not** use the transaction pooler (6543) — Orbitor relies on session features (per-workspace `search_path`, etc.).
  - A **private Storage bucket** (e.g. `orbitor-files`) and **S3 access keys** (Dashboard → Storage → S3 connection).

## 1. Configure environment
```bash
cp packages/twenty-docker/.env.supabase.example .env
# Edit .env: PG_DATABASE_URL (session pooler), STORAGE_S3_* (endpoint + keys + bucket),
# SERVER_URL, and ENCRYPTION_KEY (generate: openssl rand -base64 32).
# IS_WORKSPACE_DEMO_DATA_ENABLED=false keeps new workspaces clean.
```

## 2. Build the image (bakes in the Supabase compatibility fixes)
```bash
docker compose -f packages/twenty-docker/docker-compose.supabase.yml --env-file .env build
```
The image is built from this repo (Dockerfile target `twenty`, server + static frontend), so it includes:
- the env-tunable core pg-pool cap (`PG_POOL_MAX_CONNECTIONS`), and
- `setup-db` provisioning of `public.uuid_generate_v4()` + unaccent-in-public (Supabase installs `uuid-ossp` in a non-public schema, which Twenty's per-workspace DDL needs).

> Frontend build is memory-heavy. If the build OOMs, pre-build on the host first: `NODE_OPTIONS=--max-old-space-size=8192 npx nx build twenty-front` — the Dockerfile reuses an existing `packages/twenty-front/build/`.

## 3. Start
```bash
docker compose -f packages/twenty-docker/docker-compose.supabase.yml --env-file .env up -d
```
On first boot the **server entrypoint auto-initializes the DB**: it detects the missing `core` schema and runs `database:init:prod` (schemas + extensions + the uuid/unaccent provisioning + instance commands), then registers cron jobs and starts. The `worker` runs with migrations/cron disabled (the server owns those). Redis runs locally in the stack.

Watch health: `docker compose ... logs -f server` until `/healthz` is green.

## 4. First sign-in
Open `SERVER_URL`, "Continue with Email", and create your account + workspace. With `IS_WORKSPACE_DEMO_DATA_ENABLED=false`, the new workspace starts **empty** (no sample companies/people/workflows) — only the standard object model.

## Co-located deploy recipe (recommended for speed) — one VM in the Supabase region
The fastest, simplest setup: a single small VM **in `ap-northeast-1` (Tokyo, your Supabase region)** running this compose. Server↔DB becomes ~1–5ms, so the dozens of queries per action are effectively free; only your browser→server HTTP calls (~300ms each) remain → actions feel ~0.5–1.5s instead of ~20s.

1. Provision a small VM (2 vCPU / 4GB+) in **ap-northeast-1** — AWS EC2/Lightsail, GCP `asia-northeast1`, Fly.io `nrt`, etc.
2. Install Docker + Docker Compose Plugin.
3. Copy the repo + your filled `.env` to the VM.
4. `docker compose -f packages/twenty-docker/docker-compose.supabase.yml --env-file .env up -d --build`
5. Point `SERVER_URL` / your domain at the VM and use that instance (not the local server).

> Why a single VM (not Fly/Render multi-service): server+worker+redis sit together and ~1–5ms from Supabase, with no managed-Redis setup. For *sub-100ms end-to-end for you*, instead put BOTH this VM and the Supabase project in **your own** region.

## Notes
- **UI:** the server serves Twenty's optimized **production frontend** (not the dev server) — native design/animations, no dev-build roughness.
- **Secrets:** never commit `.env`. Rotate keys via `FALLBACK_ENCRYPTION_KEY`.
- **Out of scope here:** TLS termination / reverse proxy, DNS, managed Redis, CDN — add per your hosting.
