# Twenty CRM Runbook

> Self-hosted at `crm.xopure.com` on Railway.
> Source of truth for CRM activity. Mirrors Supabase for customer/ambassador/order data.
> Backups: native Railway daily volume backups + hourly encrypted dumps in Cloudflare R2.

---

## Initial deploy

One-time setup. Plan ~45 minutes.

### Step 1 — Generate secrets

```bash
git clone <this repo>
cd Xopure_crm
./setup-xopure-crm.sh
```

Save the printed `APP_SECRET` and `BACKUP_ENCRYPTION_KEY` to 1Password before
continuing. **Losing `BACKUP_ENCRYPTION_KEY` makes your R2 backups unrecoverable.**

### Step 2 — Provision Cloudflare R2

In the Cloudflare dashboard → R2:

1. Create bucket `xopure-twenty-uploads` (no lifecycle policy)
2. Create bucket `xopure-twenty-backups` (lifecycle: delete after 90 days)
3. R2 → Manage R2 API Tokens → Create API token, scope to both buckets
4. Save the access key + secret + endpoint URL to your `.env`

### Step 3 — Create the Railway project

In the Railway dashboard:

1. New Project → name it `xopure-crm`
2. Click `+ New` → Database → Postgres. Wait for it to spin up.
3. Click `+ New` → Database → Redis. Wait.
4. On the Redis service → Settings → set `maxmemory-policy` to `noeviction`
   (BullMQ requires this; default eviction policy will lose jobs).

### Step 4 — Deploy the three Twenty services

```bash
# In the repo root
railway link        # select the xopure-crm project

# Deploy server
cd services/server
railway up --service twenty-server

# Deploy worker (same image, different command)
cd ../worker
railway up --service twenty-worker

# Deploy backup cron
cd ../backup
railway up --service twenty-backup
```

Each `railway up` builds the Dockerfile and creates the service.

### Step 5 — Set environment variables

For each service, paste the values from your `.env` into Railway's Variables tab.
Use **variable references** (the syntax `${{Postgres.DATABASE_URL}}`) for
auto-wired connections — never paste connection strings as literals.

Per-service variables:

**twenty-server** (Web service)
- `PG_DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- `REDIS_URL` = `${{Redis.REDIS_URL}}`
- `APP_SECRET`, `SERVER_URL`, `NODE_PORT`, `MESSAGE_QUEUE_TYPE`,
  `IS_SIGN_UP_DISABLED`, `SIGN_IN_PREFILLED`
- All `STORAGE_S3_*` vars
- All `EMAIL_*` vars
- `SENTRY_DSN` (optional)

**twenty-worker** (Background worker) — same as server, except no `SERVER_URL`/`NODE_PORT`

**twenty-backup** (Cron service)
- `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- `BACKUP_ENCRYPTION_KEY`
- All `R2_*` vars
- `RETENTION_DAYS=30`

### Step 6 — Set the custom domain

```bash
cd services/server
railway domain crm.xopure.com
```

Railway prints a CNAME target. Add a CNAME record at your DNS provider:
`crm.xopure.com` → the printed target.

Once DNS propagates (1–10 min), Railway provisions SSL automatically.

### Step 7 — Create your admin account

1. Open `https://crm.xopure.com`
2. Sign up — this is allowed because the FIRST user becomes admin.
3. **Immediately** flip `IS_SIGN_UP_DISABLED=true` on twenty-server and redeploy.

This is the only window where signup is open. After this, additional users
must be invited from inside the workspace.

### Step 8 — Smoke test

- Create a test contact → does it persist after a page reload?
- Create a test webhook → does it fire on contact create?
- Wait 65 minutes for the first scheduled backup. Confirm via:
  ```bash
  aws s3 ls s3://xopure-twenty-backups/hourly/ \
    --endpoint-url https://YOUR_ACCOUNT.r2.cloudflarestorage.com
  ```

You're live.

---

## Upgrade Twenty

Cadence: once per quarter, on a Tuesday morning. ~30 minutes.

1. Read https://github.com/twentyhq/twenty/releases for everything between your
   current version and the latest stable. Look for `BREAKING` markers.
2. Edit the `FROM` line in **both** `services/server/Dockerfile` and
   `services/worker/Dockerfile`. The tags MUST match.
3. Commit. Push.
4. Deploy server first (it runs migrations), then worker:
   ```bash
   cd services/server && railway up --service twenty-server
   # Wait for healthcheck to pass — watch logs
   cd ../worker && railway up --service twenty-worker
   ```
5. Smoke test: log in, create a contact, fire a webhook.

**If anything looks wrong:** Railway dashboard → twenty-server → Deployments →
click the previous deploy → "Redeploy". The previous image starts back up in
under a minute. Repeat for twenty-worker.

**Migration note:** if a Twenty release ran a forward-incompatible migration,
rolling back the image alone won't fix the database. You'll need to restore
from the most recent backup — see "Restore from backup" below.

---

## Restore from backup

Two paths depending on the failure mode.

### Path A — Railway is healthy, data corruption / accidental delete

Use Railway's native volume backup. Up to 24h of data loss possible
depending on how recently the daily backup ran.

1. Railway dashboard → Postgres service → Backups tab
2. Pick the timestamp before the corruption
3. Click Restore. Twenty server will need to be redeployed to reconnect.

### Path B — Off-platform restore from R2

Use this if Railway itself is down, or for older-than-24h restores.

```bash
# 1. Find the dump you want
aws s3 ls s3://xopure-twenty-backups/hourly/ \
  --endpoint-url https://YOUR_ACCOUNT.r2.cloudflarestorage.com

# 2. Download it
aws s3 cp s3://xopure-twenty-backups/hourly/twenty-20260507T140000Z.sql.gz.enc \
  ./backup.enc \
  --endpoint-url https://YOUR_ACCOUNT.r2.cloudflarestorage.com

# 3. Decrypt + decompress (BACKUP_ENCRYPTION_KEY from 1Password)
gpg --batch --decrypt --passphrase "$BACKUP_ENCRYPTION_KEY" backup.enc \
  | gunzip > backup.pgdump

# 4. Restore into a fresh Postgres
#    Either: provision a new Railway Postgres and pg_restore into it
#    Or:     pg_restore into a local Postgres for inspection first
pg_restore --no-owner --no-acl --clean --if-exists \
  -d "$NEW_DATABASE_URL" backup.pgdump

# 5. Update twenty-server's PG_DATABASE_URL to point at the new DB.
#    Redeploy.
```

Always restore to a *new* database first, verify, then cut Twenty over.
Never `pg_restore` directly over a production database.

---

## Common operations

### "Sync stopped working"

1. Check Vercel logs: `https://vercel.com/xopure/api/sync/*` — any 4xx/5xx?
2. Check Twenty's webhook delivery log: Twenty → Settings → Developers → Webhooks
   → click the webhook → see recent delivery attempts and replay failed ones.
3. Check Supabase webhook logs: Supabase Studio → Database → Webhooks →
   click the webhook → see recent attempts.
4. If a specific record is out of sync: hit `/api/sync/backfill?table=affiliates&id=<uuid>`

### "Someone external can sign up"

Check `IS_SIGN_UP_DISABLED` is `true` on twenty-server and redeploy.

### "Worker isn't processing jobs"

1. Check twenty-worker logs in Railway
2. Verify `REDIS_URL` is set on the worker service
3. Verify Redis `maxmemory-policy` is `noeviction` (otherwise jobs get evicted
   under memory pressure)
4. Restart the worker: Railway dashboard → twenty-worker → Restart

### "Server is slow"

1. Railway → Postgres → Metrics → check CPU and memory
2. If Postgres is pegged, scale it up (Railway dashboard → Postgres → Settings →
   Resources)
3. If twenty-server is pegged, scale it up (same path)
4. Check for runaway queries: `SELECT * FROM pg_stat_activity WHERE state = 'active';`

### "The backup cron isn't running"

1. Railway dashboard → twenty-backup → Deployments — should show recent runs
2. Check logs of last few invocations
3. Verify all `R2_*` env vars are set
4. Manually trigger: Railway dashboard → twenty-backup → Run

---

## What lives where

| Concern | Lives in | Notes |
|---|---|---|
| Twenty source code | upstream Docker image | Pinned in our Dockerfiles |
| Twenty config | Railway env vars | Documented in `.env.example` |
| Postgres data | Railway managed Postgres | Daily volume backups |
| Off-site backups | Cloudflare R2 (`xopure-twenty-backups`) | Hourly, AES-256 encrypted |
| Attachments | Cloudflare R2 (`xopure-twenty-uploads`) | Stateless containers OK |
| BullMQ jobs | Railway managed Redis | Ephemeral; OK to lose |
| Custom objects | Defined in Twenty (Settings → Data Model) | Manual via UI for now |
| Sync logic | Vercel `/api/sync/*` | xopure.com Vercel project |
| Sync mapping | Supabase `crm_sync_map` table | xopure.com Supabase project |

---

## Cost (approximate, May 2026)

| Component | Plan | Monthly |
|---|---|---|
| Railway Postgres | usage-based, ~2GB RAM | ~$15 |
| Railway Redis | usage-based, ~512MB RAM | ~$5 |
| Railway twenty-server | usage-based, ~2GB RAM | ~$20 |
| Railway twenty-worker | usage-based, ~1GB RAM | ~$10 |
| Railway twenty-backup | runs hourly, exits | ~$1 |
| Cloudflare R2 (uploads) | first 10GB free | $0 |
| Cloudflare R2 (backups) | ~5GB after compression | ~$1 |
| **Total** | | **~$50/mo** |

Compare: Twenty Cloud is $9/seat/mo, so this beats Cloud at 6+ seats.

---

## Emergency contacts

- Railway status: https://status.railway.com
- Twenty release notes: https://github.com/twentyhq/twenty/releases
- Twenty Discord: https://discord.gg/cx5n4Jzs57
- Cloudflare status: https://www.cloudflarestatus.com
