#!/bin/bash
# Build a scrubbed development mirror from the staging clone.
#
# Runs on the machine that hosts staging. Developers do not run this; they run
# `bash deploy/local-data.sh mirror`, which invokes it over SSH.
#
# Usage:
#   bash deploy/devdata-publish.sh                 # write deploy/.devdata/*.dump
#   bash deploy/devdata-publish.sh --output PATH
#   bash deploy/devdata-publish.sh --stdout        # stream the dump to stdout
#
# Staging is never modified. The snapshot is restored into a throwaway
# devdata_build database, scrubbed there, verified, dumped, and dropped.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGING_ENV="$REPO_ROOT/deploy/.env.staging"
STAGING_COMPOSE="$REPO_ROOT/deploy/compose.staging.yml"
SCRUB_SQL="$REPO_ROOT/deploy/devdata-scrub.sql"
VERIFY_SQL="$REPO_ROOT/deploy/devdata-verify.sql"
OUTPUT_DIR="$REPO_ROOT/deploy/.devdata"
BUILD_DB="devdata_build"
SCRUB_VERSION=1
DEV_PASSWORD="devmirror"
PUBLISH_LOCK="/tmp/twenty-devdata-publish.lock"
STAGING_REFRESH_STATE="/tmp/twenty-staging-last-refresh"

# Progress always goes to stderr so --stdout can carry the dump itself.
info() {
  echo "[devdata-publish] $*" >&2
}

fail() {
  echo "[devdata-publish] ERROR: $*" >&2
  exit 1
}

to_stdout=false
output_path=""
while [ $# -gt 0 ]; do
  case "$1" in
    --stdout)
      to_stdout=true
      shift
      ;;
    --output)
      [ -n "${2:-}" ] || fail "--output requires a path."
      output_path="$2"
      shift 2
      ;;
    *)
      fail "Unknown option: $1"
      ;;
  esac
done

[ -f "$STAGING_ENV" ] ||
  fail "Missing deploy/.env.staging. This command runs on the staging host."
[ -f "$SCRUB_SQL" ] || fail "Missing deploy/devdata-scrub.sql."
[ -f "$VERIFY_SQL" ] || fail "Missing deploy/devdata-verify.sql."

command -v docker >/dev/null 2>&1 || fail "Docker is unavailable."
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  fail "Docker Compose v2 is unavailable."
fi

compose() {
  "${COMPOSE[@]}" --env-file "$STAGING_ENV" -f "$STAGING_COMPOSE" "$@"
}

psql_build() {
  compose exec -T db psql -v ON_ERROR_STOP=1 -U postgres -d "$BUILD_DB" "$@"
}

if ! mkdir "$PUBLISH_LOCK" 2>/dev/null; then
  fail "Another mirror build is already running."
fi

drop_build_db() {
  compose exec -T db dropdb -U postgres --force --if-exists "$BUILD_DB" \
    >/dev/null 2>&1 || true
}

cleanup() {
  compose exec -T db rm -f "/tmp/$BUILD_DB.dump" "/tmp/devdata-source.dump" \
    >/dev/null 2>&1 || true
  drop_build_db
  rmdir "$PUBLISH_LOCK" 2>/dev/null || true
}
trap cleanup EXIT

info "verifying the staging source"
compose up -d db >/dev/null
db_container="$(compose ps --quiet db)"
[ -n "$db_container" ] || fail "The staging database container is not running."

staging_db="$(compose exec -T db psql -U postgres -d staging -Atc \
  'SELECT current_database()')"
[ "$staging_db" = "staging" ] ||
  fail "Expected the staging database, got '$staging_db'."

if [ -f "$STAGING_REFRESH_STATE" ]; then
  info "staging last refreshed from production: $(cat "$STAGING_REFRESH_STATE")"
else
  info "staging refresh timestamp is unknown; the mirror may be stale"
fi

git_sha="$(git -C "$REPO_ROOT" rev-parse HEAD)"
source_host="$(hostname -s)"

info "restoring a staging snapshot into $BUILD_DB"
drop_build_db
compose exec -T db createdb -U postgres "$BUILD_DB"
compose exec -T db sh -c \
  "pg_dump -U postgres -d staging --format=custom --no-owner --no-privileges \
   --file=/tmp/devdata-source.dump"
compose exec -T db pg_restore \
  --username=postgres \
  --dbname="$BUILD_DB" \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  /tmp/devdata-source.dump
compose exec -T db rm -f /tmp/devdata-source.dump

info "removing third-party mailbox and calendar content"
psql_build --quiet <"$SCRUB_SQL"

psql_build --quiet -c \
  "INSERT INTO public.devdata_manifest
     (scrub_version, source_host, git_sha, dev_password)
   VALUES ($SCRUB_VERSION, '$source_host', '$git_sha', '$DEV_PASSWORD')" \
  >/dev/null

info "verifying the scrub"
psql_build --quiet <"$VERIFY_SQL"

info "writing the mirror dump"
compose exec -T db sh -c \
  "pg_dump -U postgres -d $BUILD_DB --format=custom --no-owner \
   --no-privileges --file=/tmp/$BUILD_DB.dump"

if [ "$to_stdout" = true ]; then
  compose exec -T db cat "/tmp/$BUILD_DB.dump"
  info "mirror streamed to stdout"
  exit 0
fi

if [ -z "$output_path" ]; then
  mkdir -p "$OUTPUT_DIR"
  output_path="$OUTPUT_DIR/twenty-devdata-$(date -u '+%Y%m%dT%H%M%SZ').dump"
fi
docker cp "$db_container:/tmp/$BUILD_DB.dump" "$output_path"
chmod 600 "$output_path"

# Old mirrors are stale confidential data; keep only the newest few.
if [ -d "$OUTPUT_DIR" ]; then
  ls -1t "$OUTPUT_DIR"/twenty-devdata-*.dump 2>/dev/null |
    tail -n +4 |
    while IFS= read -r stale_dump; do
      info "removing stale mirror $(basename "$stale_dump")"
      rm -f "$stale_dump"
    done
fi

info "mirror written to $output_path"
echo "$output_path"
