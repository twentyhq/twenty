#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/deploy/compose.staging.yml"
ENV_FILE="$REPO_ROOT/deploy/.env.staging"
TAILSCALE_SOCKET="/var/run/tailscaled.socket"

fail() {
  echo "[staging] ERROR: $*" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 ||
  fail "Docker is not installed. Follow deploy/STAGING.md."
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  fail "Docker Compose v2 is unavailable."
fi
[ -f "$ENV_FILE" ] ||
  fail "Missing deploy/.env.staging; copy deploy/.env.staging.example and fill it in."

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${STAGING_IMAGE:?STAGING_IMAGE is required}"
: "${STAGING_DATABASE_PASSWORD:?STAGING_DATABASE_PASSWORD is required}"
: "${STAGING_ENCRYPTION_KEY:?STAGING_ENCRYPTION_KEY is required}"

case "$STAGING_IMAGE" in
  *:latest) fail "STAGING_IMAGE must use an immutable commit SHA, not :latest." ;;
esac
case "$STAGING_IMAGE" in
  *:FULL_COMMIT_SHA) fail "Replace FULL_COMMIT_SHA in deploy/.env.staging." ;;
esac
[ "$STAGING_DATABASE_PASSWORD" != "CHANGE_ME" ] ||
  fail "Replace STAGING_DATABASE_PASSWORD."
[ "$STAGING_ENCRYPTION_KEY" != "CHANGE_ME" ] ||
  fail "Replace STAGING_ENCRYPTION_KEY."

compose() {
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

action="${1:-help}"
case "$action" in
  config)
    compose config --quiet
    echo "[staging] configuration is valid"
    ;;
  pull)
    compose pull
    ;;
  up)
    if ! docker image inspect "$STAGING_IMAGE" >/dev/null 2>&1; then
      compose pull
    else
      echo "[staging] using local image $STAGING_IMAGE"
    fi
    # --no-wait leaves the health gate to the caller. A server image newer than
    # the database cannot pass its healthcheck until migrations have run, so a
    # deploy has to be able to start containers, migrate, and only then wait.
    if [ "${2:-}" = "--no-wait" ]; then
      compose up -d --wait db redis
      # The worker declares depends_on server: service_healthy, so naming it
      # here would reimpose the health gate this flag exists to skip. It comes
      # up with the plain `up` once migrations have made the server healthy.
      compose up -d --no-deps server
      echo "[staging] datastores and server started; health gate skipped"
    else
      compose up -d
      "$0" wait
    fi
    ;;
  migrate)
    # Runs in a one-off container rather than exec-ing into the server, because
    # the server is precisely what cannot come up while the schema is behind.
    echo "[staging] applying instance migrations and workspace upgrades"
    # --include-slow matters: without it the instance step applies only fast
    # commands and leaves the slow data migrations pending forever. The cache
    # flush after the upgrade matters too, because upgrade:status is cached and
    # would otherwise still report the pre-upgrade answer.
    compose run --rm --no-deps --entrypoint sh server -c '
      set -e
      cd /app/packages/twenty-server
      node dist/command/command.js run-instance-commands --force --include-slow
      node dist/command/command.js upgrade
      node dist/command/command.js cache:flush
    '
    echo "[staging] schema is up to date"
    ;;
  wait)
    port="${STAGING_PORT:-3020}"
    bind_address="${STAGING_BIND_ADDRESS:-127.0.0.1}"
    echo "[staging] waiting for http://${bind_address}:${port}/healthz"
    for _ in $(seq 1 90); do
      if curl --fail --silent --show-error \
        "http://${bind_address}:${port}/healthz" >/dev/null 2>&1; then
        echo "[staging] healthy at http://${bind_address}:${port}"
        exit 0
      fi
      sleep 2
    done
    compose ps
    compose logs --tail=100 server
    fail "staging did not become healthy within 180 seconds"
    ;;
  test)
    "$REPO_ROOT/deploy/test-environment-isolation.sh"
    "$0" wait
    port="${STAGING_PORT:-3020}"
    bind_address="${STAGING_BIND_ADDRESS:-127.0.0.1}"
    curl --fail --silent --show-error \
      "http://${bind_address}:${port}/client-config" >/dev/null
    if [ -n "${STAGING_TAILNET_ADDRESS:-}" ] &&
      [ -n "${STAGING_TAILNET_HOSTNAME:-}" ]; then
      curl --fail --silent --show-error \
        --resolve "${STAGING_TAILNET_HOSTNAME}:${port}:${STAGING_TAILNET_ADDRESS}" \
        "https://${STAGING_TAILNET_HOSTNAME}:${port}/healthz" >/dev/null
    fi

    # /healthz and /client-config both answer 200 on an instance whose metadata
    # layer is broken, which is how staging ran for a day against a database
    # older than its image. These two checks are what actually catch that.
    "$0" verify-schema

    if compose logs --since 5m server 2>/dev/null |
      grep -m1 -E 'column .* does not exist|relation .* does not exist'; then
      fail "staging is logging missing-column errors; the schema does not match the image"
    fi

    echo "[staging] smoke tests passed"
    ;;
  verify-schema)
    upgrade_status="$(
      compose run --rm --no-deps --entrypoint sh server -c \
        'cd /app/packages/twenty-server &&
         node dist/command/command.js upgrade:status --failed-only' 2>&1
    )" || fail "unable to retrieve staging upgrade status"
    plain_status="$(printf '%s\n' "$upgrade_status" | sed $'s/\033\\[[0-9;]*m//g')"
    printf '%s\n' "$plain_status"

    # Deliberately asserts "nothing failed" rather than "up to date". A version
    # whose bundle has instance commands but no workspace commands can never be
    # reached: the inferred version comes from the latest executed workspace
    # command, so upgrade:status reports Behind permanently. 2.23.0 is such a
    # version today. Requiring "Up to date" would be a gate no deploy can pass.
    printf '%s\n' "$plain_status" |
      grep -Eq 'Workspaces:.*0 failed|No workspaces' ||
      fail "one or more staging workspace upgrades failed"

    failed_commands="$(
      compose exec -T db psql -U postgres -d staging -Atc \
        "SELECT count(*) FROM core.\"upgradeMigration\" WHERE status = 'failed'"
    )"
    [ "$failed_commands" = "0" ] ||
      fail "staging has $failed_commands failed upgrade command(s)"

    echo "[staging] no failed upgrade commands"
    ;;
  tailnet-up)
    : "${STAGING_TAILNET_ADDRESS:?Set STAGING_TAILNET_ADDRESS in deploy/.env.staging}"
    : "${STAGING_TAILNET_HOSTNAME:?Set STAGING_TAILNET_HOSTNAME in deploy/.env.staging}"
    case "$STAGING_TAILNET_ADDRESS" in
      100.*) ;;
      *) fail "STAGING_TAILNET_ADDRESS must be a 100.x Tailscale IPv4 address." ;;
    esac
    /opt/homebrew/bin/tailscale --socket="$TAILSCALE_SOCKET" serve \
      --bg --https="${STAGING_PORT:-3020}" \
      "http://127.0.0.1:${STAGING_PORT:-3020}" >/dev/null
    curl --fail --silent --show-error \
      --resolve "${STAGING_TAILNET_HOSTNAME}:${STAGING_PORT:-3020}:${STAGING_TAILNET_ADDRESS}" \
      "https://${STAGING_TAILNET_HOSTNAME}:${STAGING_PORT:-3020}/healthz" >/dev/null
    echo "[staging] tailnet access ready at https://${STAGING_TAILNET_HOSTNAME}:${STAGING_PORT:-3020}"
    ;;
  tailnet-down)
    /opt/homebrew/bin/tailscale --socket="$TAILSCALE_SOCKET" serve \
      --https="${STAGING_PORT:-3020}" off
    echo "[staging] tailnet HTTPS listener stopped"
    ;;
  logs)
    compose logs -f --tail=200
    ;;
  ps)
    compose ps
    ;;
  stop)
    compose stop
    ;;
  down)
    compose down
    ;;
  reset)
    fail "Reset deletes staging data. Run the explicit command documented in deploy/STAGING.md."
    ;;
  *)
    echo "Usage: bash deploy/staging.sh {config|pull|up [--no-wait]|migrate|wait|verify-schema|test|tailnet-up|tailnet-down|logs|ps|stop|down}"
    exit 2
    ;;
esac
