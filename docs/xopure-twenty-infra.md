# XO Pure Twenty Infrastructure

This document preserves and adapts the infrastructure README from `/Users/brians/Downloads/crm_xopure_additions` after migrating the deploy assets into the main CRM repository.

## Related Docs

- [Ambassador Access Control Plan](./ambassador-access-control.md)

## Architecture

XO Pure CRM is a self-hosted Twenty deployment designed for Railway with Cloudflare R2 off-platform backups.

```text
Railway project: xopure-crm

Services:
  twenty-server   Web service running the Twenty HTTP server on port 3000
  twenty-worker   Background worker running BullMQ jobs
  twenty-backup   Hourly cron running pg_dump -> gzip -> GPG -> Cloudflare R2

Managed dependencies:
  Postgres        Twenty application database
  Redis           BullMQ queue backend, configured with maxmemory-policy=noeviction

Cloudflare:
  DNS             crm.xopure.com CNAME to Railway domain target
  R2 uploads      xopure-twenty-uploads
  R2 backups      xopure-twenty-backups
```

## Repo Layout

```text
.
├── RUNBOOK.md
├── .env.xopure.example
├── setup-xopure-crm.sh
├── docs/xopure-twenty-infra.md
├── services/
│   ├── server/
│   │   ├── Dockerfile
│   │   └── railway.toml
│   ├── worker/
│   │   ├── Dockerfile
│   │   └── railway.toml
│   └── backup/
│       ├── Dockerfile
│       ├── backup.sh
│       └── railway.toml
├── supabase/migrations/202605070001_create_crm_sync_map.sql
└── packages/twenty-apps/internal/xopure-crm/
```

## Deploy Flow

1. Run `./setup-xopure-crm.sh` to generate `APP_SECRET` and `BACKUP_ENCRYPTION_KEY` into `.env.xopure`.
2. Create Railway project `xopure-crm` with Postgres and Redis.
3. Configure Redis with `maxmemory-policy=noeviction`.
4. Create Cloudflare R2 buckets `xopure-twenty-uploads` and `xopure-twenty-backups`.
5. Set Railway variables from `.env.xopure.example`, using Railway references for database URLs.
6. Deploy `services/server`, then `services/worker`, then `services/backup`.
7. Configure `crm.xopure.com` DNS to Railway.
8. Create the first Twenty admin, then set `IS_SIGN_UP_DISABLED=true`.
9. Deploy/install `packages/twenty-apps/internal/xopure-crm` into the Twenty workspace.
10. Apply `supabase/migrations/202605070001_create_crm_sync_map.sql` to the XO Pure Supabase project.

## Upgrade Flow

- Server and worker Dockerfiles must use the exact same `twentycrm/twenty` image tag.
- Upgrade server first so migrations run before worker jobs consume queues.
- Smoke test login, record creation, webhook delivery, and backups after each upgrade.

## Restore Flow

The backup service writes PostgreSQL custom-format dumps compressed and encrypted in R2.

Restore sequence:

```bash
aws s3 cp s3://xopure-twenty-backups/hourly/<backup>.sql.gz.enc ./backup.enc \
  --endpoint-url https://YOUR_ACCOUNT.r2.cloudflarestorage.com

gpg --batch --decrypt --passphrase "$BACKUP_ENCRYPTION_KEY" backup.enc \
  | gunzip > backup.pgdump

pg_restore --no-owner --no-acl --clean --if-exists \
  -d "$NEW_DATABASE_URL" backup.pgdump
```

Always restore into a fresh database first, verify, then cut the app over.
