# Production on this Mac

Production is the live CRM. It currently runs from:

```text
/Users/ben/Deploy/twenty
```

launchd starts `deploy/serve-public.sh` from that clone. The native production
services use backend port 3000, frontend port 3010, Postgres port 5432, and
Redis port 6379.

## Rules

- The deploy clone is not a development checkout.
- Do not edit files there.
- Do not run tests, development setup, or reset commands there.
- Deploy only reviewed commits already merged into `origin/main`.
- Use `git pull --ff-only`; never merge a feature branch in the deploy clone.
- Run staging first.

## Deploy

```bash
cd /Users/ben/Deploy/twenty
git fetch origin
git status --short --branch
git pull --ff-only origin main
```

The post-merge hook runs dependency installation, database migration, workspace
upgrade, and cache invalidation when schema files changed. Treat any error as a
failed deployment.

If frontend files changed:

```bash
bash deploy/publish-frontend.sh
```

Record the result:

```bash
git rev-parse HEAD
curl --fail http://127.0.0.1:3000/healthz
curl --fail http://127.0.0.1:3010/healthz
```

## Database-changing release

Before pulling:

```bash
cd /Users/ben/Deploy/twenty
bash deploy/backup-db.sh
```

Confirm the dump reports `OK`. After deployment, check application behavior and
the public endpoint before considering the release complete.

## Rollback

Application rollback does not automatically reverse database migrations. For a
code-only failure, return to the previously recorded reviewed SHA using a
dedicated rollback branch/PR or another explicitly recorded emergency action.
For a schema/data failure, stop and use the migration-specific recovery plan or
a verified database restore; do not improvise a destructive downgrade.
