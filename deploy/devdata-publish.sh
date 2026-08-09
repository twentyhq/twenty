#!/bin/bash
# Build a scrubbed development mirror from a production dump.
#
# Rewritten 2026-08-08 for the cloud era: the old pipeline restored a snapshot of
# the Mac's local staging (which pre-applied staging-sanitize.sql) over ssh. That
# staging is retired. The source is now the nightly production dump in R2, so
# this script applies staging-sanitize.sql itself before the developer scrub —
# a raw production dump has live sync channels and signing keys that the old
# staging source never carried.
#
# Runs on any machine with Postgres CLI tools, rclone, and R2 read credentials
# (TWENTY_R2_CONFIG, default ~/.config/twenty-production/r2.env). Developers
# without R2 access consume the artifact via `local-data.sh mirror --from-file`.
# Note the trade-off versus the old design: the raw dump transits the builder's
# machine before scrubbing. Only the scrubbed artifact may be shared onward.
#
# Usage:
#   bash deploy/devdata-publish.sh                 # write deploy/.devdata/*.dump
#   bash deploy/devdata-publish.sh --output PATH
#   bash deploy/devdata-publish.sh --stdout        # stream the dump to stdout
#   bash deploy/devdata-publish.sh --from-file P   # use P instead of pulling R2
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SANITIZE_SQL="$REPO_ROOT/deploy/staging-sanitize.sql"
SCRUB_SQL="$REPO_ROOT/deploy/devdata-scrub.sql"
VERIFY_SQL="$REPO_ROOT/deploy/devdata-verify.sql"
OUTPUT_DIR="$REPO_ROOT/deploy/.devdata"
BUILD_DB="devdata_build"
SCRUB_VERSION=1
DEV_PASSWORD="devmirror"
PUBLISH_LOCK="/tmp/twenty-devdata-publish.lock"
R2_ENV="${TWENTY_R2_CONFIG:-$HOME/.config/twenty-production/r2.env}"
# Where the build database lives. Homebrew Postgres by default; point it at the
# twenty-dev Docker Postgres with DEVDATA_PGURL if that is your stack.
PGURL="${DEVDATA_PGURL:-postgres://postgres:postgres@localhost:5432/postgres}"

export PATH="/opt/homebrew/opt/postgresql@16/bin:/opt/homebrew/bin:$PATH"

info() { echo "[devdata-publish] $*" >&2; }
fail() {
  echo "[devdata-publish] ERROR: $*" >&2
  exit 1
}

to_stdout=false
output_path=""
source_file=""
while [ $# -gt 0 ]; do
  case "$1" in
    --stdout) to_stdout=true; shift ;;
    --output)
      [ -n "${2:-}" ] || fail "--output requires a path."
      output_path="$2"; shift 2 ;;
    --from-file)
      [ -n "${2:-}" ] || fail "--from-file requires a path."
      source_file="$2"; shift 2 ;;
    *) fail "Unknown option: $1" ;;
  esac
done

[ -f "$SANITIZE_SQL" ] || fail "Missing deploy/staging-sanitize.sql."
[ -f "$SCRUB_SQL" ] || fail "Missing deploy/devdata-scrub.sql."
[ -f "$VERIFY_SQL" ] || fail "Missing deploy/devdata-verify.sql."
command -v pg_restore >/dev/null 2>&1 || fail "Postgres CLI tools are unavailable."
psql "$PGURL" -Atc 'select 1' >/dev/null 2>&1 ||
  fail "Cannot reach Postgres at $PGURL (override with DEVDATA_PGURL)."

# The build database URL, derived from the admin URL.
BUILD_URL="${PGURL%/*}/$BUILD_DB"

if ! mkdir "$PUBLISH_LOCK" 2>/dev/null; then
  fail "Another mirror build is already running."
fi

tmp_source=""
cleanup() {
  [ -n "$tmp_source" ] && rm -f "$tmp_source"
  psql "$PGURL" -Atc "drop database if exists $BUILD_DB with (force)" \
    >/dev/null 2>&1 || true
  rmdir "$PUBLISH_LOCK" 2>/dev/null || true
}
trap cleanup EXIT

# --- source ------------------------------------------------------------------
if [ -n "$source_file" ]; then
  [ -f "$source_file" ] || fail "No dump at $source_file."
  info "using the production dump at $source_file"
else
  [ -f "$R2_ENV" ] ||
    fail "Missing $R2_ENV. Pass --from-file, or get R2 read credentials."
  command -v rclone >/dev/null 2>&1 || fail "rclone is unavailable."
  # shellcheck disable=SC1090
  set -a; . "$R2_ENV"; set +a
  : "${TWENTY_BACKUP_BUCKET:?TWENTY_BACKUP_BUCKET not set in $R2_ENV}"
  # Newest by MODIFICATION TIME, not by name: the laptop-era dumps are stamped
  # in local time and the cloud box stamps in UTC, so a lexical sort can pick a
  # stale dump over a newer one.
  latest="$(rclone lsf "R2:${TWENTY_BACKUP_BUCKET}/daily/" --format "tp" 2>/dev/null | sort | tail -1 | cut -d';' -f2)"
  [ -n "$latest" ] || fail "No dumps found in R2."
  info "pulling the latest production dump: $latest"
  tmp_source="$(mktemp /tmp/devdata-source-XXXXXX.dump)"
  rclone copyto "R2:${TWENTY_BACKUP_BUCKET}/daily/$latest" "$tmp_source"
  source_file="$tmp_source"
fi

git_sha="$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
source_host="$(hostname -s)"

# --- build -------------------------------------------------------------------
info "restoring into $BUILD_DB"
psql "$PGURL" -Atc "drop database if exists $BUILD_DB with (force)" >/dev/null
psql "$PGURL" -Atc "create database $BUILD_DB" >/dev/null
pg_restore --dbname="$BUILD_URL" --no-owner --no-privileges --exit-on-error \
  "$source_file"

# Raw production dumps carry live state that the old staging source had already
# stripped. Sanitize first, then scrub.
info "disabling sync channels and secrets (staging-sanitize)"
psql "$BUILD_URL" -v ON_ERROR_STOP=1 --quiet <"$SANITIZE_SQL"

info "removing third-party mailbox and calendar content (devdata-scrub)"
psql "$BUILD_URL" -v ON_ERROR_STOP=1 --quiet <"$SCRUB_SQL"

psql "$BUILD_URL" -v ON_ERROR_STOP=1 --quiet -c \
  "INSERT INTO public.devdata_manifest
     (scrub_version, source_host, git_sha, dev_password)
   VALUES ($SCRUB_VERSION, '$source_host', '$git_sha', '$DEV_PASSWORD')" \
  >/dev/null

info "verifying the scrub"
psql "$BUILD_URL" -v ON_ERROR_STOP=1 --quiet <"$VERIFY_SQL"

# --- output ------------------------------------------------------------------
info "writing the mirror dump"
if [ "$to_stdout" = true ]; then
  pg_dump --dbname="$BUILD_URL" --format=custom --no-owner --no-privileges
  info "mirror streamed to stdout"
  exit 0
fi

if [ -z "$output_path" ]; then
  mkdir -p "$OUTPUT_DIR"
  output_path="$OUTPUT_DIR/twenty-devdata-$(date -u '+%Y%m%dT%H%M%SZ').dump"
fi
pg_dump --dbname="$BUILD_URL" --format=custom --no-owner --no-privileges \
  --file="$output_path"
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
