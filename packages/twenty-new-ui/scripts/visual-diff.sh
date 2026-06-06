#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

ARGOS_API_BASE_URL="${ARGOS_API_BASE_URL:-http://127.0.0.1:4002/v2/}"
ARGOS_TOKEN="${ARGOS_TOKEN:?ARGOS_TOKEN is required – set it in packages/twenty-new-ui/.env}"

USERNAME=$(whoami)
GIT_BRANCH="${ARGOS_BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")}"
COMMIT="${ARGOS_COMMIT:-$(git rev-parse HEAD 2>/dev/null || echo "unknown")}"
REFERENCE_COMMIT="${ARGOS_REFERENCE_COMMIT:-$(git merge-base HEAD main 2>/dev/null || echo "")}"

export ARGOS_API_BASE_URL
export ARGOS_TOKEN
export ARGOS_BUILD_NAME="${USERNAME}/twenty-new-ui"
export ARGOS_BRANCH="${USERNAME}/${GIT_BRANCH}"
export ARGOS_COMMIT="$COMMIT"
export ARGOS_REFERENCE_COMMIT="${REFERENCE_COMMIT}"

echo "Argos visual diff"
echo "  API:        $ARGOS_API_BASE_URL"
echo "  Build name: $ARGOS_BUILD_NAME"
echo "  Branch:     $ARGOS_BRANCH"
echo "  Commit:     ${ARGOS_COMMIT:0:12}"
echo "  Ref commit: ${ARGOS_REFERENCE_COMMIT:0:12}"
echo ""

npx http-server storybook-static --port 6007 --silent &
HTTP_PID=$!
trap "kill $HTTP_PID 2>/dev/null || true" EXIT

SERVER_UP=false
for i in $(seq 1 30); do
  if curl -sf http://localhost:6007 > /dev/null 2>&1; then SERVER_UP=true; break; fi
  sleep 1
done
if [[ "$SERVER_UP" != "true" ]]; then
  echo "Storybook static server did not start on http://localhost:6007 after 30s" >&2
  exit 1
fi

export STORYBOOK_URL="http://localhost:6007"
npx vitest run
