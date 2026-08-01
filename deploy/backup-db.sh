#!/bin/bash
# =============================================================================
# Nightly Postgres backup for the live Twenty CRM.
# =============================================================================
# Dumps the production database (pg_dump custom format -> restorable with
# pg_restore) into ~/Backups/twenty and prunes dumps older than 14 days.
# Connection details come from packages/twenty-server/.env (PG_DATABASE_URL),
# so no credentials live in this script.
#
# Scheduled from the DEPLOY clone via cron (see crontab -l). Run by hand:
#   bash deploy/backup-db.sh
#
# Restore (into a fresh DB, e.g. after data loss):
#   createdb -h localhost -U postgres restored
#   pg_restore -h localhost -U postgres -d restored --no-owner <dump-file>
#
# A restore also needs APP_SECRET from the password manager. It is not in the
# dump, and without it the stored Google refresh tokens cannot be decrypted, so
# every connected account has to be re-authorised by hand.
#
# Each verified dump is copied to Cloudflare R2. Credentials come from
# ~/.config/twenty-production/r2.env (see TWENTY_R2_CONFIG below); that file is
# the only place they live and is not in this repo.
# =============================================================================
set -uo pipefail
export PATH="/opt/homebrew/opt/postgresql@16/bin:/opt/homebrew/bin:$PATH"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${TWENTY_BACKUP_DIR:-$HOME/Backups/twenty}"
RETENTION_DAYS=14

# Pull the connection URL out of the server .env (format: PG_DATABASE_URL=...).
PG_URL="$(grep -E '^PG_DATABASE_URL=' "$REPO_ROOT/packages/twenty-server/.env" | head -1 | cut -d= -f2-)"
if [ -z "$PG_URL" ]; then
  echo "[backup-db] FAIL: PG_DATABASE_URL not found in $REPO_ROOT/packages/twenty-server/.env"
  exit 1
fi

STAMP="$(date +%Y-%m-%d_%H%M%S)"
OUT="$BACKUP_DIR/twenty-$STAMP.dump"
mkdir -p "$BACKUP_DIR"

echo "[backup-db] $(date) dumping to $OUT"
if ! pg_dump "$PG_URL" --format=custom --file="$OUT"; then
  echo "[backup-db] FAIL: pg_dump exited non-zero"
  rm -f "$OUT"
  exit 1
fi

# A valid dump of the CRM is tens of MB; a tiny file means something went
# silently wrong (wrong DB, empty DB). Fail loudly rather than rotate good
# backups away in favor of bad ones.
SIZE_BYTES=$(stat -f%z "$OUT")
if [ "$SIZE_BYTES" -lt 1000000 ]; then
  echo "[backup-db] FAIL: dump suspiciously small ($SIZE_BYTES bytes) — keeping it for inspection but treating as failure"
  exit 1
fi

# Verify the archive is readable by pg_restore (catalog listing, no DB touched).
if ! pg_restore --list "$OUT" >/dev/null; then
  echo "[backup-db] FAIL: pg_restore cannot read the dump"
  exit 1
fi

echo "[backup-db] OK: $(du -h "$OUT" | cut -f1) verified"

# Ship the verified dump off-box before pruning anything. A dump sitting on the
# same disk as the cluster it came from does not survive the failure it exists
# for, so an upload failure is a backup failure and must stop the prune below.
REMOTE_CONFIG="${TWENTY_R2_CONFIG:-$HOME/.config/twenty-production/r2.env}"
if [ "${TWENTY_BACKUP_SKIP_REMOTE:-0}" = "1" ]; then
  echo "[backup-db] WARN: TWENTY_BACKUP_SKIP_REMOTE=1 — this dump exists on this machine only"
elif [ ! -r "$REMOTE_CONFIG" ]; then
  echo "[backup-db] FAIL: no readable R2 config at $REMOTE_CONFIG"
  exit 1
else
  # rclone reads remotes from RCLONE_CONFIG_<NAME>_*, so sourcing this defines
  # the r2: remote with no rclone.conf to keep in sync.
  set -a
  . "$REMOTE_CONFIG"
  set +a
  REMOTE_PATH="r2:${TWENTY_BACKUP_BUCKET}/daily/$(basename "$OUT")"

  echo "[backup-db] uploading to $REMOTE_PATH"
  if ! rclone copyto "$OUT" "$REMOTE_PATH"; then
    echo "[backup-db] FAIL: upload failed — keeping local dumps unpruned"
    exit 1
  fi

  # Confirm the object landed at the expected size. An upload nobody read back
  # is a guess, and this is the copy that matters.
  REMOTE_BYTES="$(rclone size --json "$REMOTE_PATH" 2>/dev/null |
    sed -E 's/.*"bytes":([0-9]+).*/\1/')"
  if [ "$REMOTE_BYTES" != "$SIZE_BYTES" ]; then
    echo "[backup-db] FAIL: offsite copy is ${REMOTE_BYTES:-missing}, expected $SIZE_BYTES — keeping local dumps unpruned"
    exit 1
  fi
  echo "[backup-db] OK: offsite copy verified ($REMOTE_BYTES bytes)"
fi

# Prune old dumps, but never prune on a failed run (we exit above on failure).
find "$BACKUP_DIR" -name 'twenty-*.dump' -mtime +"$RETENTION_DAYS" -delete
echo "[backup-db] retained: $(ls "$BACKUP_DIR" | grep -c '\.dump$') dumps"
