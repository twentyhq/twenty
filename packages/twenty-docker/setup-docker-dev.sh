#!/bin/bash
# =============================================================================
# Twenty CRM — Development Environment Setup
# =============================================================================
# Starts Postgres + Redis (local services or Docker), creates databases,
# copies .env files, and installs JS dependencies.
# Idempotent — safe to run multiple times.
#
# Usage (from repo root):
#   bash packages/twenty-docker/setup-docker-dev.sh          # auto-detect
#   bash packages/twenty-docker/setup-docker-dev.sh --docker  # force Docker
#   bash packages/twenty-docker/setup-docker-dev.sh --down    # stop services
#   bash packages/twenty-docker/setup-docker-dev.sh --reset   # wipe data & restart
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.dev.yml"

# --------------- helpers ---------------
info()  { echo "=> $*"; }
ok()    { echo "   done: $*"; }
fail()  { echo "   FAIL: $*" >&2; }

wait_for_pg() {
  local retries=30
  while ! pg_isready -h localhost -p 5432 -U postgres -q 2>/dev/null; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then
      fail "PostgreSQL did not become ready in time"; exit 1
    fi
    sleep 1
  done
}

wait_for_redis() {
  local retries=30
  while ! redis-cli -h localhost -p 6379 ping 2>/dev/null | grep -q PONG; do
    retries=$((retries - 1))
    if [ "$retries" -le 0 ]; then
      fail "Redis did not become ready in time"; exit 1
    fi
    sleep 1
  done
}

can_use_docker() {
  docker compose version &>/dev/null 2>&1
}

has_local_pg() {
  command -v pg_ctlcluster &>/dev/null && pg_lsclusters 2>/dev/null | grep -q "16"
}

has_local_redis() {
  command -v redis-server &>/dev/null
}

ensure_node_version() {
  local required_major=24
  local nvmrc_file="$REPO_ROOT/.nvmrc"
  local current_version
  current_version="$(node --version 2>/dev/null || echo "none")"
  local current_major="${current_version#v}"
  current_major="${current_major%%.*}"

  if [ "$current_major" -ge "$required_major" ] 2>/dev/null; then
    ok "Node $current_version (>= v${required_major}.x)"
    return
  fi

  info "Node $current_version found, but v${required_major}.x+ is required"

  # Try nvm
  if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
    if [ -f "$nvmrc_file" ]; then
      nvm install 2>/dev/null && nvm use 2>/dev/null && return
    fi
    nvm install "$required_major" 2>/dev/null && nvm use "$required_major" 2>/dev/null && return
  fi

  # Try downloading binary directly
  if command -v curl &>/dev/null; then
    local arch
    arch="$(uname -m)"
    case "$arch" in
      x86_64)  arch="x64" ;;
      aarch64) arch="arm64" ;;
    esac
    local node_dir="/opt/node${required_major}"
    if [ -x "$node_dir/bin/node" ]; then
      export PATH="$node_dir/bin:$PATH"
      ok "Using pre-installed Node from $node_dir"
      return
    fi
  fi

  fail "Could not install Node v${required_major}+. Please install it manually:"
  echo "     nvm install ${required_major}   OR   https://nodejs.org/en/download/"
  exit 1
}

USE_DOCKER=false
if [ "${1:-}" = "--docker" ]; then
  USE_DOCKER=true
  shift
fi

# --------------- flags ---------------
if [ "${1:-}" = "--down" ]; then
  info "Stopping dev services..."
  if can_use_docker && docker compose -f "$COMPOSE_FILE" ps --quiet 2>/dev/null | grep -q .; then
    docker compose -f "$COMPOSE_FILE" down
  fi
  if has_local_pg; then
    sudo pg_ctlcluster 16 main stop 2>/dev/null || true
  fi
  if has_local_redis && pgrep redis-server &>/dev/null; then
    sudo service redis-server stop 2>/dev/null || true
  fi
  ok "Services stopped."
  exit 0
fi

if [ "${1:-}" = "--reset" ]; then
  info "Resetting dev services (wiping data)..."
  if can_use_docker; then
    docker compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true
  fi
  if has_local_pg; then
    sudo pg_ctlcluster 16 main stop 2>/dev/null || true
    sudo pg_dropcluster 16 main --stop 2>/dev/null || true
    sudo pg_createcluster 16 main 2>/dev/null || true
  fi
  info "Restarting fresh..."
fi

# =============================================================================
# 0. Ensure correct Node version
# =============================================================================
info "Checking Node.js version..."
ensure_node_version

# =============================================================================
# 1. Start services
# =============================================================================

# Auto-detect: prefer local services, fall back to Docker
if [ "$USE_DOCKER" = true ]; then
  info "Starting Postgres and Redis via Docker Compose..."
  docker compose -f "$COMPOSE_FILE" up -d
else
  # --- PostgreSQL ---
  if pg_isready -h localhost -p 5432 -U postgres -q 2>/dev/null; then
    ok "PostgreSQL already running on localhost:5432"
  elif has_local_pg; then
    info "Starting local PostgreSQL 16..."
    sudo pg_ctlcluster 16 main start 2>/dev/null
    # Ensure 'postgres' user has password 'postgres' for local dev
    wait_for_pg
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null || true
  elif can_use_docker; then
    info "No local PostgreSQL found, using Docker..."
    docker compose -f "$COMPOSE_FILE" up -d db
  else
    fail "No PostgreSQL available. Install PostgreSQL 16 or Docker."
    exit 1
  fi

  # --- Redis ---
  if redis-cli -h localhost -p 6379 ping 2>/dev/null | grep -q PONG; then
    ok "Redis already running on localhost:6379"
  elif has_local_redis; then
    info "Starting local Redis..."
    sudo service redis-server start 2>/dev/null || redis-server --daemonize yes 2>/dev/null
  elif can_use_docker; then
    info "No local Redis found, using Docker..."
    docker compose -f "$COMPOSE_FILE" up -d redis
  else
    fail "No Redis available. Install Redis or Docker."
    exit 1
  fi
fi

info "Waiting for PostgreSQL..."
wait_for_pg
ok "PostgreSQL is ready on localhost:5432"

info "Waiting for Redis..."
wait_for_redis
ok "Redis is ready on localhost:6379"

# =============================================================================
# 2. Create databases
# =============================================================================
info "Creating databases (if they don't exist)..."
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d postgres \
  -c 'CREATE DATABASE "default";' 2>/dev/null || true
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d postgres \
  -c 'CREATE DATABASE "test";' 2>/dev/null || true
ok "Databases 'default' and 'test' are ready"

# =============================================================================
# 3. Environment files
# =============================================================================
info "Setting up .env files from .env.example..."
cd "$REPO_ROOT"

for pkg in twenty-front twenty-server; do
  src="packages/$pkg/.env.example"
  dst="packages/$pkg/.env"
  if [ -f "$src" ]; then
    if [ ! -f "$dst" ]; then
      cp "$src" "$dst"
      ok "$pkg/.env created"
    else
      ok "$pkg/.env already exists (skipped)"
    fi
  fi
done

# =============================================================================
# 4. Dependencies
# =============================================================================
if [ ! -d "$REPO_ROOT/node_modules" ] || [ ! -d "$REPO_ROOT/node_modules/.cache" ]; then
  info "Installing dependencies (yarn install)..."
  yarn install
  ok "Dependencies installed"
else
  ok "Dependencies already installed (skipped)"
fi

# =============================================================================
# Done
# =============================================================================
echo ""
echo "=========================================="
echo "  Dev environment is ready!"
echo "=========================================="
echo ""
echo "  Start the app:  yarn start"
echo "  Or individually:"
echo "    npx nx start twenty-front      # frontend  -> http://localhost:3001"
echo "    npx nx start twenty-server     # backend   -> http://localhost:3000"
echo ""
echo "  Stop services:  bash packages/twenty-docker/setup-docker-dev.sh --down"
echo "  Full reset:     bash packages/twenty-docker/setup-docker-dev.sh --reset"
echo ""
