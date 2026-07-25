#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/deploy/compose.staging.yml"

fail() {
  echo "[isolation-test] FAIL: $*" >&2
  exit 1
}

grep -q '^name: twenty-staging$' "$COMPOSE_FILE" ||
  fail "staging Compose project name is missing"
grep -q '${STAGING_BIND_ADDRESS:-127.0.0.1}:${STAGING_PORT:-3020}:3000' \
  "$COMPOSE_FILE" ||
  fail "staging web port does not require an explicit bind address"

if grep -A12 '^  db:' "$COMPOSE_FILE" | grep -q 'ports:'; then
  fail "staging Postgres must not publish a host port"
fi
if grep -A10 '^  redis:' "$COMPOSE_FILE" | grep -q 'ports:'; then
  fail "staging Redis must not publish a host port"
fi

if rg -n 'localhost:(5432|6379)|127\.0\.0\.1:(5432|6379)' \
  "$COMPOSE_FILE" >/dev/null; then
  fail "staging references production datastore ports"
fi

echo "[isolation-test] PASS: staging has an isolated project, private datastores, and a localhost-only web port"
