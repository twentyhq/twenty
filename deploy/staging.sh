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
    compose up -d
    "$0" wait
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
    echo "[staging] smoke tests passed"
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
    echo "Usage: bash deploy/staging.sh {config|pull|up|wait|test|tailnet-up|tailnet-down|logs|ps|stop|down}"
    exit 2
    ;;
esac
