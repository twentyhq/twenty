#!/usr/bin/env bash
# Dumps Twenty's Postgres, then snapshots the dump, file storage and deploy config
# into an encrypted restic repo. Keeps 7 daily + 4 weekly snapshots.
set -euo pipefail
source "$(dirname "$0")/lib.sh"
set -a; source "$OPS_DIR/.env"; set +a

trap 'alert "backup FAILED"' ERR

[ -s "$RESTIC_PASSWORD_FILE" ] || { echo "missing $RESTIC_PASSWORD_FILE" >&2; exit 1; }

used_percent=$(df --output=pcent "$BACKUP_DIR" | tail -1 | tr -dc 0-9)
[ "$used_percent" -lt 85 ] || alert "backup disk ${used_percent}% full"

[ -e "$BACKUP_DIR/restic-repo/config" ] || restic -- init

mkdir -p "$BACKUP_DIR/dumps"
rm -f "$BACKUP_DIR"/dumps/*.dump
"${COMPOSE[@]}" exec -T db pg_dump -U "$PG_DATABASE_USER" -Fc "$PG_DATABASE_NAME" \
  > "$BACKUP_DIR/dumps/twenty-$(date -u +%Y%m%dT%H%M%SZ).dump"

restic \
  -v "$BACKUP_DIR/dumps:/data/dumps:ro" \
  -v jai-os_server-local-data:/data/storage:ro \
  -v "$OPS_DIR:/data/ops:ro" \
  -- backup /data/dumps /data/storage /data/ops \
  --exclude /data/ops/backups --exclude /data/ops/secrets --exclude /data/ops/logs

restic -- forget --keep-daily 7 --keep-weekly 4 --prune

date -u +%FT%TZ > "$BACKUP_DIR/last-success"
echo "backup ok"
