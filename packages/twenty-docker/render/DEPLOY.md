# Orbitor production deploy — Vercel (front) + Render (backend) + Supabase (DB)

Architecture: **Vercel** serves the frontend (global SPA) → calls the **Render**
backend (NestJS API + BullMQ worker + Key Value/Redis, Frankfurt) → which uses
**Supabase** `orbitor-eu` (Postgres + S3 storage, Frankfurt / eu-central-1).
Everything backend-side is co-located in Frankfurt for speed (Israel ≈ 60–80 ms).

The repo config is already in place and pushed (`feat/supabase-local-compat`):
`render.yaml`, `packages/twenty-docker/render/Dockerfile`, `vercel.json`.

Known facts (no secrets):
- Supabase project ref: `ekkvmiysodfqwzcxibax` (eu-central-1)
- Storage bucket: `orbitor-files` (created, private)
- S3 endpoint: `https://ekkvmiysodfqwzcxibax.supabase.co/storage/v1/s3`

---

## Phase A — Supabase secrets (dashboard, ~3 min)

Open the `orbitor-eu` project.

1. **DB URL** → top "Connect" → **Session pooler** tab → copy the URI. Must be the
   **Session** pooler (port **5432**), NOT transaction (6543). It looks like:
   ```
   postgresql://postgres.ekkvmiysodfqwzcxibax:[PASSWORD]@aws-X-eu-central-1.pooler.supabase.com:5432/postgres
   ```
   If you don't have the password: Settings → Database → **Reset database password**,
   set one, then copy the session pooler URI with it. → this is **`PG_DATABASE_URL`**.

2. **S3 keys** → Project Settings → Storage → **S3 connection** → New access key →
   copy **Access key ID** and **Secret access key**.
   → `STORAGE_S3_ACCESS_KEY_ID` and `STORAGE_S3_SECRET_ACCESS_KEY`.

## Phase B — Render backend (dashboard, ~5 min + build)

3. Render → **New → Blueprint** → connect GitHub `zzeenniitthh/orbitor` → branch
   **`feat/supabase-local-compat`** → it reads `render.yaml` → **Apply**.
4. Render prompts for these (`sync: false`) — paste:

   | Variable | Value |
   |---|---|
   | `PG_DATABASE_URL` | from A.1 (session pooler) |
   | `STORAGE_S3_NAME` | `orbitor-files` |
   | `STORAGE_S3_ENDPOINT` | `https://ekkvmiysodfqwzcxibax.supabase.co/storage/v1/s3` |
   | `STORAGE_S3_ACCESS_KEY_ID` | from A.2 |
   | `STORAGE_S3_SECRET_ACCESS_KEY` | from A.2 |
   | `SERVER_URL` | `https://orbitor-server.onrender.com` (use the real URL Render shows for the `orbitor-server` service if the name was taken) |
   | `FRONTEND_URL` | `https://orbitor-twenty-server.vercel.app` |

   Auto-handled (no input): `APP_SECRET` (generated), `REDIS_URL` (wired to the
   Key Value instance), `STORAGE_S3_REGION=eu-central-1`, `PG_POOL_MAX_CONNECTIONS=3`,
   `NODE_PORT=10000`, `IS_WORKSPACE_DEMO_DATA_ENABLED=false`.

5. Apply → Render builds **orbitor-server** (web) + **orbitor-worker** + **orbitor-redis**.
   First boot runs DB init on Supabase (a few min). Watch `orbitor-server` logs until
   `/healthz` is healthy. Note the actual server URL.

## Phase C — Vercel frontend (dashboard, ~2 min + build)

6. Vercel project `orbitor-twenty-server` → Settings → **Environment Variables** →
   add `REACT_APP_SERVER_BASE_URL` = the Render server URL from B.5
   (e.g. `https://orbitor-server.onrender.com`).
7. Settings → **Git** → set Production Branch to `feat/supabase-local-compat`
   (or merge that branch to `main`). If the build ignores `vercel.json`, set
   Framework Preset = **Other**.
8. Redeploy. `vercel.json` builds `twenty-front` and injects the server URL.
   Front is served at `https://orbitor-twenty-server.vercel.app`.

## Phase D — finalize + verify

9. If the real Render/Vercel URLs differ from the predictions above, update
   `SERVER_URL` + `FRONTEND_URL` (Render) and `REACT_APP_SERVER_BASE_URL` (Vercel)
   to match, and redeploy.
10. Open the Vercel URL, "Continue with Email", create your account + workspace
    (starts clean — no demo data), and test CRUD. Co-located → should feel fast.

> Notes: the Tokyo `orbitor` Supabase project was **paused** (free-tier 2-project
> limit) — it held only test data and can be restored or deleted later. Auth uses
> bearer tokens (not cookies), so the cross-origin Vercel→Render setup needs no
> extra CORS config.
