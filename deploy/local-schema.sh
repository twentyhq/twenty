#!/bin/bash
# Keep a developer-owned Twenty database aligned with the checked-out commit.
#
# Usage:
#   bash deploy/local-schema.sh guard
#   bash deploy/local-schema.sh check
#   bash deploy/local-schema.sh sync
#
# This command deliberately accepts only the standard localhost development
# database and Redis URLs. It must never be used for staging or production.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_ENV="$REPO_ROOT/packages/twenty-server/.env"
PRODUCTION_ROOT="/Users/ben/Deploy/twenty"

fail() {
  echo "[local-schema] ERROR: $*" >&2
  exit 1
}

info() {
  echo "[local-schema] $*"
}

read_env_value() {
  local key="$1"

  sed -n "s/^${key}=//p" "$SERVER_ENV" | head -1 | tr -d '"'
}

verify_local_target() {
  [ "$REPO_ROOT" != "$PRODUCTION_ROOT" ] ||
    fail "Refusing to run in the production checkout."
  [ -f "$SERVER_ENV" ] ||
    fail "Missing packages/twenty-server/.env. Run setup-dev-env.sh first."
  [ -d "$REPO_ROOT/node_modules" ] ||
    fail "Dependencies are missing. Run yarn install first."

  PG_DATABASE_URL="$(read_env_value PG_DATABASE_URL)"
  REDIS_URL="$(read_env_value REDIS_URL)"

  [ "$PG_DATABASE_URL" = \
    "postgres://postgres:postgres@localhost:5432/default" ] ||
    fail "PG_DATABASE_URL must be the standard localhost development database."
  [ "$REDIS_URL" = "redis://localhost:6379" ] ||
    fail "REDIS_URL must be the standard localhost development Redis."

  local compose

  if docker compose version >/dev/null 2>&1; then
    compose=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    compose=(docker-compose)
  else
    fail "Docker Compose is required for the team development environment."
  fi
  compose+=(-f "$REPO_ROOT/packages/twenty-docker/docker-compose.dev.yml")
  local db_container
  local redis_container

  db_container="$("${compose[@]}" ps --quiet db)"
  redis_container="$("${compose[@]}" ps --quiet redis)"
  [ -n "$db_container" ] && [ -n "$redis_container" ] ||
    fail "The twenty-dev Docker services are not running. Run setup-dev-env.sh --docker."

  [ "$(docker inspect -f '{{.State.Running}}' "$db_container")" = "true" ] ||
    fail "The twenty-dev PostgreSQL container is not running."
  [ "$(docker inspect -f '{{.State.Running}}' "$redis_container")" = "true" ] ||
    fail "The twenty-dev Redis container is not running."

  "${compose[@]}" exec -T db pg_isready -U postgres -d default -q ||
    fail "Local development PostgreSQL is not ready."
  [ "$("${compose[@]}" exec -T redis redis-cli ping 2>/dev/null)" = "PONG" ] ||
    fail "Local development Redis is not ready."
}

run_upgrade_status() {
  local output
  local plain_output

  output="$(
    npx nx run twenty-server:command -- upgrade:status --failed-only 2>&1
  )" || fail "Unable to retrieve schema upgrade status."
  printf '%s\n' "$output"

  plain_output="$(printf '%s\n' "$output" | sed $'s/\033\\[[0-9;]*m//g')"
  case "$plain_output" in
    *"Failed to retrieve upgrade status"*)
      fail "The schema upgrade status command reported an error."
      ;;
  esac
  printf '%s\n' "$plain_output" |
    grep -Eq 'Instance:[[:space:]]+Up to date' ||
    fail "The local instance schema is not up to date."
  if ! printf '%s\n' "$plain_output" |
    grep -Eq 'Workspaces:.*0 behind,.*0 failed|No workspaces'; then
    fail "One or more local workspace schemas are behind or failed."
  fi
}

action="${1:-}"
case "$action" in
  guard)
    verify_local_target
    info "local twenty-dev target verified"
    ;;
  check)
    verify_local_target
    info "dry-running pending workspace upgrades"
    npx nx run twenty-server:command -- upgrade --dry-run
    info "checking instance and workspace upgrade status"
    run_upgrade_status
    info "schema status check complete"
    ;;
  sync)
    verify_local_target
    info "applying pending instance migrations"
    npx nx run twenty-server:database:migrate

    info "applying pending workspace upgrades"
    npx nx run twenty-server:command -- upgrade

    info "invalidating local metadata caches"
    npx nx run twenty-server:command -- \
      cache:flat-cache-invalidate --all-metadata

    info "verifying final upgrade status"
    run_upgrade_status
    info "local schema is synchronized with the checked-out commit"
    ;;
  *)
    echo "Usage: bash deploy/local-schema.sh {guard|check|sync}" >&2
    exit 2
    ;;
esac
