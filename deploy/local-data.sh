#!/bin/bash
# Manage the datasets used by developer-owned environments.
#
# Two datasets exist. The fixture is small, deterministic and synthetic. The
# mirror is a scrubbed copy of real CRM records, which is what makes schema
# work realistic.
#
# Usage:
#   bash deploy/local-data.sh seed
#   bash deploy/local-data.sh verify
#   bash deploy/local-data.sh reset --yes
#   bash deploy/local-data.sh mirror
#   bash deploy/local-data.sh mirror --from-file PATH
#
# The destructive actions run only after local-schema.sh verifies that the
# target is the isolated twenty-dev Docker project.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/packages/twenty-docker/docker-compose.dev.yml"
SEED_WORKSPACE_ID="20202020-1c25-4d02-bf25-6aeccf7ea419"
VERIFY_SQL="$REPO_ROOT/deploy/devdata-verify.sql"
MIRROR_HOST="${TWENTY_DEVDATA_HOST:-spectech-llm}"
MIRROR_REMOTE_REPO="${TWENTY_DEVDATA_REMOTE_REPO:-~/Projects/twenty}"
MIRROR_PASSWORD="devmirror"
MIRROR_TEMP_DIR=""

fail() {
  echo "[local-data] ERROR: $*" >&2
  exit 1
}

info() {
  echo "[local-data] $*"
}

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  fail "Docker Compose is required."
fi
COMPOSE+=(-f "$COMPOSE_FILE")

psql_dev() {
  "${COMPOSE[@]}" exec -T db \
    psql -v ON_ERROR_STOP=1 -U postgres -d default "$@"
}

is_mirror() {
  [ "$(psql_dev -Atc \
    "SELECT to_regclass('public.devdata_manifest') IS NOT NULL")" = "t" ]
}

verify_fixture() {
  local schema_name
  local counts

  schema_name="$(
    psql_dev -Atc \
      "SELECT \"databaseSchema\" FROM core.workspace WHERE id = '$SEED_WORKSPACE_ID'"
  )"
  [[ "$schema_name" =~ ^workspace_[a-z0-9]+$ ]] ||
    fail "The deterministic seed workspace is missing or has an invalid schema."

  counts="$(
    psql_dev -AtF '|' -c "
      SELECT 'workspaceMember', count(*) FROM \"$schema_name\".\"workspaceMember\"
      UNION ALL SELECT 'company', count(*) FROM \"$schema_name\".company
      UNION ALL SELECT 'person', count(*) FROM \"$schema_name\".person
      UNION ALL SELECT 'opportunity', count(*) FROM \"$schema_name\".opportunity
      UNION ALL SELECT 'task', count(*) FROM \"$schema_name\".task
      UNION ALL SELECT 'note', count(*) FROM \"$schema_name\".note
      ORDER BY 1;
    "
  )"
  printf '%s\n' "$counts"

  while IFS='|' read -r table_name record_count; do
    [ -n "$table_name" ] || continue
    if [ "$record_count" -lt 1 ] || [ "$record_count" -gt 5 ]; then
      fail "$table_name has $record_count records; expected between 1 and 5."
    fi
  done <<<"$counts"

  local orphan_count

  orphan_count="$(
    psql_dev -Atc "
      SELECT
        (SELECT count(*) FROM \"$schema_name\".person p
          WHERE p.\"companyId\" IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM \"$schema_name\".company c
              WHERE c.id = p.\"companyId\"
            ))
        +
        (SELECT count(*) FROM \"$schema_name\".opportunity o
          WHERE o.\"companyId\" IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM \"$schema_name\".company c
              WHERE c.id = o.\"companyId\"
            ));
    "
  )"
  [ "$orphan_count" = "0" ] ||
    fail "The fixture contains $orphan_count orphaned company relationship(s)."

  info "fixture verification passed for workspace $SEED_WORKSPACE_ID"
}

seed_fixture() {
  local workspace_count

  workspace_count="$(psql_dev -Atc 'SELECT count(*) FROM core.workspace')"
  if [ "$workspace_count" -gt 0 ]; then
    local seeded_workspace_count

    seeded_workspace_count="$(
      psql_dev -Atc \
        "SELECT count(*) FROM core.workspace WHERE id = '$SEED_WORKSPACE_ID'"
    )"
    [ "$workspace_count" = "1" ] && [ "$seeded_workspace_count" = "1" ] ||
      fail "The local database already contains a different workspace. Use reset --yes."
    info "deterministic workspace already exists; verifying it"
    verify_fixture
    return
  fi

  info "loading the deterministic light development fixture"
  npx nx run twenty-server:command -- workspace:seed:dev --light
  verify_fixture
}

verify_mirror() {
  psql_dev --quiet <"$VERIFY_SQL"

  local manifest

  manifest="$(
    psql_dev -AtF ' ' -c \
      'SELECT "scrubbed_at", "source_host", "git_sha"
       FROM public.devdata_manifest'
  )"
  info "mirror built at $manifest"
  info "mirror verification passed"
}

wipe_local_database() {
  "${COMPOSE[@]}" exec -T db dropdb -U postgres --force --if-exists default
  "${COMPOSE[@]}" exec -T db createdb -U postgres default
}

fetch_mirror() {
  local destination="$1"
  local source_file="$2"

  if [ -n "$source_file" ]; then
    [ -f "$source_file" ] || fail "No mirror dump at $source_file."
    info "using the mirror dump at $source_file"
    cp "$source_file" "$destination"
  else
    command -v ssh >/dev/null 2>&1 ||
      fail "ssh is required to pull a mirror. Use mirror --from-file instead."
    info "building a fresh mirror on $MIRROR_HOST; this takes a few minutes"
    # A non-interactive ssh shell gets a minimal PATH that misses Homebrew, so
    # docker is invisible on the remote. Prepend it rather than using a login
    # shell, whose profile output would corrupt the dump streaming on stdout.
    ssh "$MIRROR_HOST" \
      "PATH=/opt/homebrew/bin:/usr/local/bin:\$PATH \
       bash $MIRROR_REMOTE_REPO/deploy/devdata-publish.sh --stdout" \
      >"$destination"
  fi

  [ -s "$destination" ] || fail "The mirror dump is empty."
}

install_mirror() {
  local source_file="$1"
  local dump_file
  local db_container

  # The trap fires after this function returns, so the directory it removes has
  # to outlive the local scope or cleanup dies on an unbound variable and the
  # mirror dump survives on disk.
  MIRROR_TEMP_DIR="$(mktemp -d)"
  dump_file="$MIRROR_TEMP_DIR/devdata.dump"
  trap 'rm -rf "${MIRROR_TEMP_DIR:-}"' EXIT

  info "stop 'yarn start' before continuing; the database is dropped and rebuilt"
  fetch_mirror "$dump_file" "$source_file"

  db_container="$("${COMPOSE[@]}" ps --quiet db)"

  info "replacing the local twenty-dev database with the mirror"
  wipe_local_database
  docker cp "$dump_file" "$db_container:/tmp/devdata.dump"
  "${COMPOSE[@]}" exec -T db pg_restore \
    --username=postgres \
    --dbname=default \
    --no-owner \
    --no-privileges \
    --exit-on-error \
    /tmp/devdata.dump
  "${COMPOSE[@]}" exec -T db rm -f /tmp/devdata.dump

  # Fail closed: an unscrubbed dump must not survive on the machine, whatever
  # produced it.
  if ! verify_mirror; then
    wipe_local_database
    fail "This dump is not a verified mirror. The local database was wiped."
  fi

  info "clearing the local metadata cache"
  "${COMPOSE[@]}" exec -T redis redis-cli FLUSHALL >/dev/null

  info "aligning the mirror with the checked-out commit"
  bash "$REPO_ROOT/deploy/local-schema.sh" sync

  info "mirror ready at http://localhost:3001"
  info "sign in with any of these accounts and the password $MIRROR_PASSWORD:"
  psql_dev -Atc 'SELECT email FROM core."user" ORDER BY "createdAt" LIMIT 5'
}

action="${1:-}"
case "$action" in
  seed)
    bash "$REPO_ROOT/deploy/local-schema.sh" guard
    bash "$REPO_ROOT/deploy/local-schema.sh" check
    seed_fixture
    ;;
  verify)
    bash "$REPO_ROOT/deploy/local-schema.sh" guard
    bash "$REPO_ROOT/deploy/local-schema.sh" check
    if is_mirror; then
      verify_mirror
    else
      verify_fixture
    fi
    ;;
  reset)
    [ "${2:-}" = "--yes" ] ||
      fail "Reset deletes all local twenty-dev data. Re-run with reset --yes."
    bash "$REPO_ROOT/deploy/local-schema.sh" guard
    info "resetting only the isolated twenty-dev database and cache"
    npx nx run twenty-server:database:reset --configuration=no-seed
    seed_fixture
    ;;
  mirror)
    shift
    mirror_source=""
    while [ $# -gt 0 ]; do
      case "$1" in
        --from-file)
          [ -n "${2:-}" ] || fail "--from-file requires a path."
          mirror_source="$2"
          shift 2
          ;;
        *)
          fail "Unknown option: $1"
          ;;
      esac
    done
    bash "$REPO_ROOT/deploy/local-schema.sh" guard
    install_mirror "$mirror_source"
    ;;
  *)
    echo "Usage: bash deploy/local-data.sh" \
      "{seed|verify|reset --yes|mirror [--from-file PATH]}" >&2
    exit 2
    ;;
esac
