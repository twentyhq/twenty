#!/usr/bin/env bash
# Restores the latest snapshot into a throwaway Postgres container and checks it.
# Touches nothing in the live stack. Run monthly and before major upgrades.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

work="$(mktemp -d)"
container="jai-os-restore-test"
cleanup() { docker rm -f "$container" >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT

restic -v "$work:/restore" -- restore latest --target /restore
restic -v "$work:/restore" --entrypoint /bin/sh -- -c "chown -R $(id -u):$(id -g) /restore"

dump=$(ls "$work"/data/dumps/*.dump)
[ -d "$work/data/storage" ] || { echo "storage missing from snapshot" >&2; exit 1; }
[ -f "$work/data/ops/docker-compose.yml" ] || { echo "deploy config missing from snapshot" >&2; exit 1; }

docker run -d --name "$container" -e POSTGRES_PASSWORD=restore-test postgres:16.15 >/dev/null
until docker exec "$container" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
docker exec "$container" createdb -U postgres restored
docker exec -i "$container" pg_restore -U postgres -d restored --no-owner < "$dump"

tables=$(docker exec "$container" psql -U postgres -d restored -tAc \
  "select count(*) from information_schema.tables where table_schema not in ('pg_catalog','information_schema')")
[ "$tables" -gt 0 ] || { echo "restored database is empty" >&2; exit 1; }
echo "restore ok: $tables tables restored from $(basename "$dump")"
