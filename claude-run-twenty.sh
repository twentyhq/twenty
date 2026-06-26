#!/usr/bin/env bash
# =============================================================================
# Twenty CRM — one-shot bootstrap & run for the Claude Code remote environment
# =============================================================================
# Encodes the lessons from a real setup so the next run is smooth:
#   1. The container defaults to Node 22, but Twenty requires Node ^24.5.0
#      (.nvmrc pins 24.16.0). nvm lives at /opt/nvm; we install the right
#      version and symlink it into ~/.local/bin, which is already at the FRONT
#      of PATH for the non-interactive shells the tooling uses.
#   2. `yarn install` can hit transient proxy errors ("ReadError: server
#      aborted"). We pass valid Yarn 4 network settings (httpTimeout/httpRetry/
#      networkConcurrency — NOT the invalid networkTimeout) and retry.
#   3. Postgres 16 + Redis are installed locally but start DOWN. The repo's own
#      setup-dev-env.sh starts them, creates DBs, writes .env, runs migrations —
#      so once Node + node_modules are ready, we just delegate to it.
#   4. The server restarts once in watch mode during first compile, so a single
#      health check can hit a dead window — we wait for 2 consecutive successes.
#
# Idempotent. Safe to re-run. Run from anywhere:
#   bash claude-run-twenty.sh
# =============================================================================
set -uo pipefail

REPO_ROOT="${TWENTY_REPO_ROOT:-/home/user/twenty}"
LOG_DIR="${TMPDIR:-/tmp}/twenty-claude"
START_LOG="$LOG_DIR/twenty-start.log"
mkdir -p "$LOG_DIR"
cd "$REPO_ROOT"

say() { echo; echo "=== $* ==="; }

# --- 1. Node (read version from .nvmrc, default 24.16.0) ----------------------
NODE_VERSION="$(tr -d '[:space:]' < "$REPO_ROOT/.nvmrc" 2>/dev/null)"
[ -z "$NODE_VERSION" ] && NODE_VERSION="24.16.0"
NODE_MAJOR="${NODE_VERSION%%.*}"

say "Ensuring Node v$NODE_VERSION is active (project requires ^24.5.0)"
if ! node --version 2>/dev/null | grep -q "^v${NODE_MAJOR}\."; then
  export NVM_DIR=/opt/nvm
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm ls "$NODE_VERSION" >/dev/null 2>&1 || nvm install "$NODE_VERSION"
  N24="$NVM_DIR/versions/node/v${NODE_VERSION}/bin"
  mkdir -p "$HOME/.local/bin"
  for b in node npm npx corepack; do ln -sf "$N24/$b" "$HOME/.local/bin/$b"; done
  export PATH="$HOME/.local/bin:$PATH"
fi
echo "node: $(node --version)   npm: $(npm --version)   yarn: $(yarn --version)"

# --- 2. Dependencies (retry on transient proxy/network errors) ----------------
say "Installing dependencies with yarn (retry-on-network-failure)"
attempt=1; max=5
until YARN_HTTP_TIMEOUT=600000 YARN_HTTP_RETRY=8 YARN_NETWORK_CONCURRENCY=8 yarn install; do
  if [ "$attempt" -ge "$max" ]; then
    echo "yarn install failed after $max attempts" >&2; exit 1
  fi
  echo "yarn install attempt $attempt failed (likely transient) — retrying in $((attempt*2))s..."
  attempt=$((attempt+1)); sleep $((attempt*2))
done

# --- 3. Services + DB + env + migrations (delegate to the repo script) --------
# setup-dev-env.sh: starts Postgres 16 + Redis, creates default/test DBs,
# writes .env files, and runs migrations. Idempotent.
say "Starting Postgres + Redis, creating DBs, writing .env, running migrations"
bash packages/twenty-utils/setup-dev-env.sh

# --- 4. Start the stack (server :3000, front :3001, worker) --------------------
say "Starting Twenty (server + frontend + worker)"
already_up() {
  curl -fsS -o /dev/null -m 3 http://localhost:3000/healthz 2>/dev/null \
    && curl -fsS -o /dev/null -m 3 http://localhost:3001 2>/dev/null
}
if already_up; then
  echo "Twenty already running."
else
  nohup yarn start > "$START_LOG" 2>&1 &
  echo "yarn start launched (PID $!) — logs: $START_LOG"
fi

# --- 5. Wait for readiness (2 consecutive OKs dodges the watch-mode restart) ---
say "Waiting for services (first compile can take a few minutes)"
ok_streak=0
for _ in $(seq 1 120); do          # up to ~10 min
  if already_up; then ok_streak=$((ok_streak+1)); else ok_streak=0; fi
  [ "$ok_streak" -ge 2 ] && break
  # surface a hard failure early instead of waiting the full timeout
  if grep -qiE "EADDRINUSE|Cannot find module|error Command failed|exited with code [1-9]" "$START_LOG" 2>/dev/null; then
    echo "Detected a startup error:"; grep -iE "EADDRINUSE|Cannot find module|error Command failed|exited with code [1-9]" "$START_LOG" | tail -5
  fi
  sleep 5
done

if [ "$ok_streak" -ge 2 ]; then
  say "Twenty is UP"
  echo "  Frontend: http://localhost:3001"
  echo "  Backend:  http://localhost:3000/healthz"
  echo "  GraphQL:  http://localhost:3000/graphql"
  echo "  Logs:     $START_LOG"
  echo "  Sign in with \"Continue with Email\" (dev credentials are prefilled)."
else
  echo "Services did not become ready in time — last 30 log lines:" >&2
  tail -30 "$START_LOG" >&2
  exit 1
fi
