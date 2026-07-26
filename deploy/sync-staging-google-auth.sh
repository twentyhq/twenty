#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCTION_ENV="/Users/ben/Deploy/twenty/packages/twenty-server/.env"
STAGING_ENV="$REPO_ROOT/deploy/.env.staging"

[ -f "$PRODUCTION_ENV" ] || {
  echo "[staging-google-auth] missing production environment" >&2
  exit 1
}
[ -f "$STAGING_ENV" ] || {
  echo "[staging-google-auth] missing staging environment" >&2
  exit 1
}

read_value() {
  sed -n "s/^$1=//p" "$PRODUCTION_ENV" | head -1 | tr -d '"'
}

upsert() {
  key="$1"
  value="$2"
  temp_file="$(mktemp)"
  awk -v key="$key" -v line="$key=$value" '
    BEGIN { replaced = 0 }
    index($0, key "=") == 1 {
      if (!replaced) print line
      replaced = 1
      next
    }
    { print }
    END { if (!replaced) print line }
  ' "$STAGING_ENV" >"$temp_file"
  mv "$temp_file" "$STAGING_ENV"
}

client_id="$(read_value AUTH_GOOGLE_CLIENT_ID)"
client_secret="$(read_value AUTH_GOOGLE_CLIENT_SECRET)"
[ -n "$client_id" ] || {
  echo "[staging-google-auth] production Google client ID is missing" >&2
  exit 1
}
[ -n "$client_secret" ] || {
  echo "[staging-google-auth] production Google client secret is missing" >&2
  exit 1
}

set -a
# shellcheck disable=SC1090
source "$STAGING_ENV"
set +a

: "${STAGING_TAILNET_HOSTNAME:?Set STAGING_TAILNET_HOSTNAME}"

base_url="https://${STAGING_TAILNET_HOSTNAME}:${STAGING_PORT:-3020}"
upsert STAGING_SERVER_URL "$base_url"
upsert STAGING_AUTH_GOOGLE_ENABLED true
upsert STAGING_AUTH_GOOGLE_CLIENT_ID "$client_id"
upsert STAGING_AUTH_GOOGLE_CLIENT_SECRET "$client_secret"
upsert STAGING_AUTH_GOOGLE_CALLBACK_URL \
  "$base_url/auth/google/redirect"
upsert STAGING_AUTH_GOOGLE_APIS_CALLBACK_URL \
  "$base_url/auth/google-apis/get-access-token"
upsert STAGING_CALENDAR_PROVIDER_GOOGLE_ENABLED true

echo "[staging-google-auth] configured staging callbacks:"
echo "[staging-google-auth]   $base_url/auth/google/redirect"
echo "[staging-google-auth]   $base_url/auth/google-apis/get-access-token"
