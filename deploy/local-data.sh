#!/bin/bash
# Manage the small deterministic dataset used by developer-owned environments.
#
# Usage:
#   bash deploy/local-data.sh seed
#   bash deploy/local-data.sh verify
#   bash deploy/local-data.sh reset --yes
#
# reset is destructive, but local-schema.sh first verifies that the target is
# the isolated twenty-dev Docker project.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/packages/twenty-docker/docker-compose.dev.yml"
SEED_WORKSPACE_ID="20202020-1c25-4d02-bf25-6aeccf7ea419"

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
    verify_fixture
    ;;
  reset)
    [ "${2:-}" = "--yes" ] ||
      fail "Reset deletes all local twenty-dev data. Re-run with reset --yes."
    bash "$REPO_ROOT/deploy/local-schema.sh" guard
    info "resetting only the isolated twenty-dev database and cache"
    npx nx run twenty-server:database:reset --configuration=no-seed
    seed_fixture
    ;;
  *)
    echo "Usage: bash deploy/local-data.sh {seed|verify|reset --yes}" >&2
    exit 2
    ;;
esac
