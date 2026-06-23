# Deploy Orbitor — simple step-by-step (Railway + Cloudflare)

This guide is written to be followed click-by-click. You need **two accounts**:

- **Railway** (railway.app) — runs the backend: the server, the worker, the database (Postgres), and Redis.
- **Cloudflare** (dash.cloudflare.com) — runs the frontend (Pages) and stores uploaded files (R2).

```
   Cloudflare Pages  ─────►  Railway server ──►  Railway Postgres + Redis
   (the website)              (the backend)
        files ▲                     │
   Cloudflare R2  ◄─────────────────┘
   (uploaded files)
```

**Do the parts in this order** (each part needs a value from the part before):
**1) Cloudflare R2 → 2) Railway → 3) Cloudflare Pages → 4) connect the two URLs → 5) sign in.**

Everything in code is already done and pushed to GitHub (`zzeenniitthh/orbitor`, branch
`deploy/railway-cloudflare`). You only click in dashboards and copy values.

> 💡 Keep a scratch note open. You'll collect **6 values** as you go:
> `APP_SECRET`, `R2 Access Key ID`, `R2 Secret Access Key`, `Railway server URL`,
> `Cloudflare Pages URL`. (The R2 endpoint is already filled in for you.)

> First, generate one secret now. Open a terminal and run:
> ```
> openssl rand -base64 32
> ```
> Copy the output — that's your **`APP_SECRET`**. Save it in your scratch note.

---

## Part 1 — Cloudflare R2 (file storage) → gives you 2 keys

1. Go to **dash.cloudflare.com** → left sidebar **R2**.
2. If it's your first time, it asks you to **enable R2** (you must add a card; the
   free tier is genuinely free — 10 GB). Click through to enable.
3. Click **Create bucket**. Name it exactly:
   ```
   orbitor-files
   ```
   Location: leave **Automatic** (or pick EU). Click **Create bucket**.
4. Now make the access keys. Top-right of the R2 page click **{ } API** →
   **Manage API Tokens** → **Create API Token** (or "Create Account API token").
   - **Permissions:** choose **Object Read & Write**.
   - (Optional) scope it to the `orbitor-files` bucket.
   - Click **Create**.
5. Cloudflare shows the keys **once**. Copy these two into your scratch note:
   - **Access Key ID** → this is `STORAGE_S3_ACCESS_KEY_ID`
   - **Secret Access Key** → this is `STORAGE_S3_SECRET_ACCESS_KEY`

That's all from Cloudflare for now. (Your S3 endpoint is already known — see the block in Part 2.)

---

## Part 2 — Railway (backend: server + worker + Postgres + Redis)

### 2a. Create the project from GitHub
1. Go to **railway.app** → **New Project** → **Deploy from GitHub repo**.
2. Pick the repo **`zzeenniitthh/orbitor`**. (If you don't see it, click
   "Configure GitHub App" and give Railway access to that repo.)
3. Railway creates one service. Open it. We'll configure it as the **server**.

### 2b. Point the server at the right Dockerfile + branch
In the service → **Settings**:
- **Source / Branch:** set to `deploy/railway-cloudflare`.
- **Build → Builder:** `Dockerfile`.
- **Build → Dockerfile Path:** paste exactly:
  ```
  packages/twenty-docker/server/Dockerfile
  ```
- (Optional, recommended) **Deploy → Healthcheck Path:** `/healthz`
- **Region:** pick **EU West (Amsterdam)** if offered (closest to Israel; keep all
  services + databases in the same region).
- Rename the service to **`server`** (top of the page) so it's easy to tell apart.

### 2c. Add Postgres and Redis (one click each)
In the project canvas (the board view):
1. Click **Create** (or **+ New**) → **Database** → **Add PostgreSQL**.
2. Click **Create** → **Database** → **Add Redis**.

You don't copy anything from these — Railway wires them in automatically via the
`${{Postgres.DATABASE_URL}}` and `${{Redis.REDIS_URL}}` references in the variables below.

### 2d. Set the server's variables
Open the **server** service → **Variables** tab → click **Raw Editor** →
paste this whole block, then replace the 4 `<<PASTE …>>` placeholders:

```
PG_DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
APP_SECRET=<<PASTE your openssl secret>>
NODE_PORT=3000
SERVER_URL=https://PLACEHOLDER-fill-in-step-2f
FRONTEND_URL=https://PLACEHOLDER-fill-in-part-4
STORAGE_TYPE=s3
STORAGE_S3_NAME=orbitor-files
STORAGE_S3_ENDPOINT=https://5aec49dc270dd7fd739f1e8e72f0030d.r2.cloudflarestorage.com
STORAGE_S3_REGION=auto
STORAGE_S3_ACCESS_KEY_ID=<<PASTE R2 Access Key ID>>
STORAGE_S3_SECRET_ACCESS_KEY=<<PASTE R2 Secret Access Key>>
IS_WORKSPACE_DEMO_DATA_ENABLED=false
```

Click **Save**. (We fix the two `PLACEHOLDER` URLs in steps 2f and Part 4.)

### 2e. Add the worker service (same repo, one extra setting)
The worker runs background jobs. It's the same image with a different start command.
1. Project canvas → **Create / + New** → **GitHub Repo** → pick `zzeenniitthh/orbitor` again.
2. Open the new service → **Settings**:
   - Branch: `deploy/railway-cloudflare`
   - Build → Builder: `Dockerfile`
   - Build → Dockerfile Path: `packages/twenty-docker/server/Dockerfile`
   - **Deploy → Custom Start Command:**
     ```
     yarn worker:prod
     ```
   - Region: same as the server (EU West).
   - Rename the service to **`worker`**.
3. Open the **worker** → **Variables** → **Raw Editor** → paste the **same block as 2d**,
   then add these **two extra lines** at the end:
   ```
   DISABLE_DB_MIGRATIONS=true
   DISABLE_CRON_JOBS_REGISTRATION=true
   ```
   (The worker must NOT run migrations/cron — only the server does.) Click **Save**.

### 2f. Give the server a public URL
1. Open the **server** service → **Settings → Networking** → **Generate Domain**.
2. When asked for the port, enter **3000**.
3. Copy the URL it gives you (looks like `https://server-production-xxxx.up.railway.app`).
   - Save it as your **Railway server URL**.
   - Go back to **server → Variables** and set `SERVER_URL` to this exact URL. Save.

### 2g. Let it build
Railway now builds and deploys both services. The **first** server boot also sets up
the database — **this takes several minutes**, that's normal. Watch **server → Deployments
→ logs** until you see it become healthy (the `/healthz` check goes green). The image
build itself can take ~10–15 min the first time.

---

## Part 3 — Cloudflare Pages (the website)

1. **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Pages** tab →
   **Connect to Git** → pick `zzeenniitthh/orbitor`.
2. **Production branch:** `deploy/railway-cloudflare`.
3. **Build settings:**
   - **Framework preset:** `None`
   - **Build command:** paste exactly:
     ```
     NODE_OPTIONS=--max-old-space-size=8192 npx nx build twenty-front && cd packages/twenty-front && ./scripts/inject-runtime-env.sh
     ```
   - **Build output directory:**
     ```
     packages/twenty-front/build
     ```
4. **Environment variables** (expand "Environment variables (advanced)") → add one:
   - Name: `REACT_APP_SERVER_BASE_URL`
   - Value: your **Railway server URL** from step 2f (e.g. `https://server-production-xxxx.up.railway.app`)
5. Click **Save and Deploy**. The first build takes a while (it builds the whole app).
6. When done, Cloudflare gives you a URL like `https://orbitor-xxx.pages.dev`.
   - Save it as your **Cloudflare Pages URL**.

---

## Part 4 — Connect the two URLs (the last wiring)

The backend needs to know the website's address (for links + sign-in redirects).
1. Back in **Railway → server → Variables**: set
   `FRONTEND_URL` = your **Cloudflare Pages URL**. Save.
2. Do the same on the **worker** service's `FRONTEND_URL`. Save.
3. Railway redeploys automatically. Wait for it to go healthy.

---

## Part 5 — First sign-in (done!)

1. Open your **Cloudflare Pages URL** in the browser.
2. Click **Continue with Email**, create your account, and create your workspace.
   - The workspace starts **clean** (no demo/sample data).
3. Add a company, a person — confirm it saves. 🎉

---

## If something goes wrong

- **Website loads but says it can't reach the server / network errors:**
  `REACT_APP_SERVER_BASE_URL` (Cloudflare Pages) must exactly equal your Railway
  server URL, and `FRONTEND_URL` (Railway) must equal your Pages URL. Fix and redeploy both.
- **Server keeps restarting:** check **server → logs**. Usually a wrong
  `PG_DATABASE_URL` (make sure Postgres was added to the project) or a missing R2 key.
- **File uploads fail (avatars don't stick):** re-check the three `STORAGE_S3_*`
  values and that the bucket is named `orbitor-files`.
- **Cloudflare Pages build fails on memory/timeout:** rare; the build command already
  raises Node's memory. If it persists, tell me and I'll switch the front to a
  pre-built deploy (build locally, upload with `wrangler`).
- **Railway domain port:** if the URL shows "Application failed to respond", make sure
  the generated domain's port is **3000** (server → Settings → Networking).

## Cost note
- Cloudflare Pages + R2: free tier is plenty to start.
- Railway: needs the **Hobby plan ($5/mo)** for the databases to stay up; real usage
  for this app is typically ~$10–25/mo total.

## What each value is (quick reference)

| Variable | What it is | Where it comes from |
|---|---|---|
| `APP_SECRET` | signs logins, encrypts secrets | `openssl rand -base64 32` |
| `PG_DATABASE_URL` | database connection | auto — Railway Postgres plugin |
| `REDIS_URL` | queue/cache connection | auto — Railway Redis plugin |
| `SERVER_URL` | backend's own address | Railway → server → Generate Domain |
| `FRONTEND_URL` | website address | Cloudflare Pages URL |
| `STORAGE_S3_ENDPOINT` | R2 address | already filled in (your account) |
| `STORAGE_S3_ACCESS_KEY_ID` | R2 login | Cloudflare R2 → API token |
| `STORAGE_S3_SECRET_ACCESS_KEY` | R2 password | Cloudflare R2 → API token |
| `REACT_APP_SERVER_BASE_URL` | tells the website where the backend is | = your Railway server URL |
