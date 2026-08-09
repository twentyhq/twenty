#!/bin/bash
# Refresh the local dev database from the latest scrubbed production mirror.
#
# For the Homebrew-Postgres dev setup on this Mac (not the Docker dev stack that
# local-data.sh drives). One command: build a scrubbed mirror from the newest
# production dump in R2, drop and recreate twenty_dev, restore, flush Redis.
#
# Because the mirror is built from a production dump, the dev schema is whatever
# production is running — this is also how the dev DB stays current with prod
# migrations. Run it after a production deploy adds migrations, or whenever you
# want fresh data.
#
#   bash deploy/refresh-dev-db.sh                # pull latest from R2
#   bash deploy/refresh-dev-db.sh --from-file P  # use an existing prod dump
#
# Stop `yarn start` first: the database is dropped and recreated.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_DB="${TWENTY_DEV_DB:-twenty_dev}"
PG_ADMIN="${TWENTY_DEV_PGADMIN:-postgres://postgres:postgres@localhost:5432/postgres}"
DEV_URL="${PG_ADMIN%/*}/$DEV_DB"
export PATH="/opt/homebrew/opt/postgresql@16/bin:/opt/homebrew/bin:$PATH"

info() { echo "[refresh-dev-db] $*"; }
fail() { echo "[refresh-dev-db] ERROR: $*" >&2; exit 1; }

# Guard: this must never point at a real deployment. The dev DB is local only.
case "$PG_ADMIN" in
  *localhost*|*127.0.0.1*) ;;
  *) fail "PG_ADMIN is not local ($PG_ADMIN); refusing to drop a remote database." ;;
esac

mirror="$(mktemp /tmp/devdata-mirror-XXXXXX.dump)"
cleanup() { rm -f "$mirror"; }
trap cleanup EXIT

info "building a scrubbed mirror from the latest production dump"
# devdata-publish.sh applies staging-sanitize + devdata-scrub and verifies.
bash "$REPO_ROOT/deploy/devdata-publish.sh" --output "$mirror" "$@" >/dev/null

# Belt and braces: never load a dump that is not a verified mirror.
if ! pg_restore --list "$mirror" 2>/dev/null | grep -q 'devdata_manifest'; then
  fail "The built dump has no devdata_manifest; refusing to load it."
fi

info "recreating $DEV_DB"
psql "$PG_ADMIN" -Atc "drop database if exists $DEV_DB with (force)" >/dev/null
psql "$PG_ADMIN" -Atc "create database $DEV_DB" >/dev/null

info "restoring the mirror"
pg_restore --dbname="$DEV_URL" --no-owner --no-privileges --exit-on-error "$mirror"

info "flushing Redis so no stale metadata cache survives"
redis-cli flushall >/dev/null

users="$(psql "$DEV_URL" -Atc 'select count(*) from core."user"')"
migration="$(psql "$DEV_URL" -Atc 'select name from core."upgradeMigration" order by "createdAt" desc limit 1')"
info "done: $DEV_DB has $users users, schema at $migration"
info "sign in with any account and the password 'devmirror'"
