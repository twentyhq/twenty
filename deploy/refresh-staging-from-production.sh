#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGING_ENV="$REPO_ROOT/deploy/.env.staging"
STAGING_COMPOSE="$REPO_ROOT/deploy/compose.staging.yml"
PRODUCTION_ENV="/Users/ben/Deploy/twenty/packages/twenty-server/.env"
PRODUCTION_FILES="/Users/ben/Deploy/twenty/packages/twenty-server/.local-storage"
REFRESH_STATE="/tmp/twenty-staging-last-refresh"
REFRESH_LOCK="/tmp/twenty-staging-refresh.lock"

fail() {
  echo "[staging-refresh] ERROR: $*" >&2
  exit 1
}

[ "${1:-}" = "--yes" ] ||
  fail "This replaces all staging data. Re-run with --yes."

if ! mkdir "$REFRESH_LOCK" 2>/dev/null; then
  fail "Another staging refresh is already running"
fi
release_lock() {
  rmdir "$REFRESH_LOCK" 2>/dev/null || true
}
trap release_lock EXIT

[ -f "$STAGING_ENV" ] || fail "Missing $STAGING_ENV"
[ -f "$PRODUCTION_ENV" ] || fail "Missing production environment file"
[ -d "$PRODUCTION_FILES" ] || fail "Missing production file storage"

command -v pg_dump >/dev/null || fail "pg_dump is unavailable"
command -v pg_restore >/dev/null || fail "pg_restore is unavailable"
command -v docker >/dev/null || fail "Docker is unavailable"
if ! docker info >/dev/null 2>&1; then
  command -v colima >/dev/null ||
    fail "Docker is stopped and Colima is unavailable"
  echo "[staging-refresh] starting Colima"
  colima start
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  fail "Docker Compose v2 is unavailable"
fi

compose() {
  "${COMPOSE[@]}" --env-file "$STAGING_ENV" -f "$STAGING_COMPOSE" "$@"
}

PRODUCTION_URL="$(
  sed -n 's/^PG_DATABASE_URL=//p' "$PRODUCTION_ENV" | head -1 | tr -d '"'
)"
[ -n "$PRODUCTION_URL" ] ||
  fail "PG_DATABASE_URL is missing from production environment"

TEMP_DIR="$(mktemp -d)"
DUMP_FILE="$TEMP_DIR/production.dump"
cleanup() {
  rm -f "$DUMP_FILE"
  rmdir "$TEMP_DIR" 2>/dev/null || true
  release_lock
}
trap cleanup EXIT

echo "[staging-refresh] verifying production and staging targets"
PRODUCTION_DB="$(psql "$PRODUCTION_URL" -Atc 'SELECT current_database()')"
[ "$PRODUCTION_DB" = "default" ] ||
  fail "Expected production database 'default', got '$PRODUCTION_DB'"

compose up -d db redis
STAGING_DB="$(compose exec -T db psql -U postgres -d staging -Atc \
  'SELECT current_database()')"
[ "$STAGING_DB" = "staging" ] ||
  fail "Expected staging database 'staging', got '$STAGING_DB'"

echo "[staging-refresh] stopping staging application processes"
compose stop server worker >/dev/null 2>&1 || true

echo "[staging-refresh] creating a read-only production snapshot"
pg_dump "$PRODUCTION_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="$DUMP_FILE"
pg_restore --list "$DUMP_FILE" >/dev/null

echo "[staging-refresh] replacing staging database"
compose exec -T db dropdb -U postgres --force --if-exists staging
compose exec -T db createdb -U postgres staging

# Restore through the database container; staging Postgres has no host port.
docker cp "$DUMP_FILE" "$(compose ps -q db)":/tmp/production.dump
compose exec -T db pg_restore \
  --username=postgres \
  --dbname=staging \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  /tmp/production.dump
compose exec -T db rm -f /tmp/production.dump

echo "[staging-refresh] neutralizing external side effects"
compose exec -T db psql -U postgres -d staging \
  <"$REPO_ROOT/deploy/staging-sanitize.sql"

echo "[staging-refresh] clearing staging Redis"
compose exec -T redis redis-cli FLUSHALL >/dev/null

echo "[staging-refresh] replacing staging file storage"
FILE_HELPER="twenty-staging-file-refresh"
docker rm -f "$FILE_HELPER" >/dev/null 2>&1 || true
docker create \
  --name "$FILE_HELPER" \
  -v twenty-staging_staging-server-data:/data \
  alpine:3.20 sleep infinity >/dev/null
docker start "$FILE_HELPER" >/dev/null
docker exec "$FILE_HELPER" sh -c 'find /data -mindepth 1 -delete'
docker cp "$PRODUCTION_FILES/." "$FILE_HELPER":/data/
docker exec "$FILE_HELPER" chown -R 1000:1000 /data
docker rm -f "$FILE_HELPER" >/dev/null

echo "[staging-refresh] starting staging and running migrations/upgrades"
# Same order as staging-converge.sh: start without the health gate, migrate,
# then require health. The server no longer migrates from its entrypoint, so
# the restored production schema has to be brought forward explicitly here.
"$REPO_ROOT/deploy/staging.sh" up --no-wait
"$REPO_ROOT/deploy/staging.sh" migrate
"$REPO_ROOT/deploy/staging.sh" wait
"$REPO_ROOT/deploy/staging.sh" up
"$REPO_ROOT/deploy/staging.sh" tailnet-up
"$REPO_ROOT/deploy/staging.sh" test

PRODUCTION_WORKSPACES="$(psql "$PRODUCTION_URL" -Atc \
  'SELECT count(*) FROM core.workspace')"
STAGING_WORKSPACES="$(compose exec -T db psql -U postgres -d staging -Atc \
  'SELECT count(*) FROM core.workspace')"
[ "$PRODUCTION_WORKSPACES" = "$STAGING_WORKSPACES" ] ||
  fail "Workspace mismatch: production=$PRODUCTION_WORKSPACES staging=$STAGING_WORKSPACES"

STAGING_SYNC_ENABLED="$(compose exec -T db psql -U postgres -d staging -Atc \
  'SELECT (SELECT count(*) FROM core."messageChannel" WHERE "isSyncEnabled")
        + (SELECT count(*) FROM core."calendarChannel" WHERE "isSyncEnabled")')"
[ "$STAGING_SYNC_ENABLED" = "0" ] ||
  fail "Staging still has $STAGING_SYNC_ENABLED enabled sync channel(s)"

STAGING_ACTIVE_WORKFLOWS="$(compose exec -T db psql -U postgres -d staging -Atc \
  "SELECT count(*) FROM core.\"workflowVersion\" WHERE status = 'ACTIVE'")"
[ "$STAGING_ACTIVE_WORKFLOWS" = "0" ] ||
  fail "Staging still has $STAGING_ACTIVE_WORKFLOWS active workflow(s)"

date -u '+%Y-%m-%dT%H:%M:%SZ' >"$REFRESH_STATE"
echo "[staging-refresh] complete: $STAGING_WORKSPACES workspace(s), external side effects disabled"
