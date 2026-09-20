# JAI OS ops

Runs our own build of Twenty: upstream release plus a small patch (see `docs/adr/0002-build-our-own-twenty-image-from-a-patched-release.md`). Only this directory goes on the VPS, not the monorepo.

## Layout

- `docker-compose.yml`: caddy, server, worker, db, redis. Only caddy publishes ports. db and redis sit on an internal network with no route out.
- `Caddyfile`: automatic TLS for `$DOMAIN`.
- `scripts/`: `init-env.sh`, `backup.sh`, `restore-test.sh`, `healthcheck.sh`.
- Not in git: `.env` (secrets), `secrets/` (restic password, SSH key), `backups/`, `logs/`.

## First deploy

```bash
./scripts/init-env.sh crm.example.com          # writes .env with fresh secrets
openssl rand -base64 32 > secrets/restic-password && chmod 600 secrets/restic-password
docker compose up -d
```

DNS for the domain must point at the VPS before the first start so Caddy can get a certificate. Then create the first admin in the UI. Staff get the Member role. Install the Invoice app from `packages/twenty-apps/internal/invoice`.

Store a copy of `secrets/restic-password` and `.env` somewhere other than this VPS. Without the restic password the backups cannot be read.

## Backups

`scripts/backup.sh` dumps Postgres, then snapshots the dump, file storage and deploy config (minus secrets) into an encrypted restic repo in `backups/`. It keeps 7 daily and 4 weekly snapshots. Cron it daily:

```
15 2 * * * /path/to/ops/scripts/backup.sh >> /path/to/ops/logs/backup.log 2>&1
```

Same-VPS storage is an accepted limitation: losing the VPS loses production and backups together.

## Monitoring

`scripts/healthcheck.sh` checks disk, memory, container health and backup freshness, and appends problems to `logs/alerts.log`. Cron it every 5 minutes. Telegram alerts arrive in Phase 2. A check running on the VPS cannot report that the whole VPS is down.

```
*/5 * * * * /path/to/ops/scripts/healthcheck.sh
```

## Restore test

Monthly and before major upgrades: `scripts/restore-test.sh`. It restores the latest snapshot into a throwaway Postgres container and checks the tables, storage and config are present. It does not touch the live stack.

To actually restore: stop the stack, restore the snapshot to a temp dir, `pg_restore` the dump into the db container, copy `data/storage` back into the `jai-os_server-local-data` volume, start the stack.

## Upgrades and rollback

Versions are pinned in `docker-compose.yml` (and `TAG` in `.env` for Twenty). No automatic upgrades.

1. Read the Twenty release notes for the target version.
2. Cut a new release branch from the upstream tag (`git fetch https://github.com/twentyhq/twenty.git refs/tags/twenty/vX.Y.Z:refs/tags/twenty/vX.Y.Z`), cherry-pick our patches from the previous `jai-twenty-*` branch, push it.
3. Run the "Build JAI OS Twenty image" workflow with that ref, a new tag and the upstream version.
4. Run `scripts/backup.sh`, then `scripts/restore-test.sh`.
5. Try the new `TAG` on a local copy with synthetic data first.
6. Change `TAG`, `docker compose pull && docker compose up -d`.

Rollback: reverting `TAG` alone does not undo a database migration. To roll back, stop the stack, restore the pre-upgrade snapshot (database and storage), set the old `TAG`, start.

## Image registry

The image is `ghcr.io/codaswin/twenty`. If the package is private, log in on the VPS once with a token that has `read:packages`: `docker login ghcr.io`. Making the package public (GitHub, Packages, package settings) avoids that.

## Resource limits

The memory and CPU limits in the compose file are starting values, not measured ones. Check `docker stats` on the real VPS and adjust before adding Phase 2 services.

## Storage

Files live in a local volume (Twenty's stock default, covered by the backup). MinIO was left out on purpose: its community Docker images stopped at a September 2025 release. To use S3-compatible storage later, set the `STORAGE_S3_*` variables and `STORAGE_TYPE=s3` on server and worker.
