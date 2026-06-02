#!/bin/bash
# Twenty local dev lifecycle: start | stop | restart | status
# stop = app + Docker Postgres/Redis; restart = full stop then start
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/packages/twenty-docker/docker-compose.dev.yml"
SERVER_ENV="$REPO_ROOT/packages/twenty-server/.env"

info() { echo "=> $*"; }
ok() { echo "   $*"; }

port_from_url() {
  local url="$1" default_port="$2"
  if [[ "$url" =~ :([0-9]+)(/|$) ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "$default_port"
  fi
}

read_env_ports() {
  PG_PORT=5432
  REDIS_PORT=6379
  API_PORT=3000
  FRONT_PORT=3001
  if [[ -f "$SERVER_ENV" ]]; then
    local pg_url redis_url frontend_url
    pg_url="$(grep -E '^PG_DATABASE_URL=' "$SERVER_ENV" | cut -d= -f2- || true)"
    redis_url="$(grep -E '^REDIS_URL=' "$SERVER_ENV" | cut -d= -f2- || true)"
    frontend_url="$(grep -E '^FRONTEND_URL=' "$SERVER_ENV" | cut -d= -f2- || true)"
    [[ -n "$pg_url" ]] && PG_PORT="$(port_from_url "$pg_url" 5432)"
    [[ -n "$redis_url" ]] && REDIS_PORT="$(port_from_url "$redis_url" 6379)"
    [[ -n "$frontend_url" ]] && FRONT_PORT="$(port_from_url "$frontend_url" 3001)"
  fi
}

pids_on_port() {
  lsof -ti ":$1" 2>/dev/null || true
}

kill_port() {
  local port="$1"
  local pids
  pids="$(pids_on_port "$port")"
  if [[ -n "$pids" ]]; then
    info "Stopping processes on port $port"
    echo "$pids" | xargs kill 2>/dev/null || true
    sleep 1
    pids="$(pids_on_port "$port")"
    [[ -n "$pids" ]] && echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

stop_app() {
  read_env_ports
  kill_port "$API_PORT"
  kill_port "$FRONT_PORT"
  kill_port 3002
  kill_port 3003
  pkill -f "nest start --watch" 2>/dev/null || true
  pkill -f "twenty-server:worker" 2>/dev/null || true
  pkill -f "nx run-many -t start -p twenty-server twenty-front" 2>/dev/null || true
  pkill -f "packages/twenty-front.*vite" 2>/dev/null || true
  ok "App processes stopped"
}

pg_is_up() {
  if command -v pg_isready &>/dev/null; then
    pg_isready -h localhost -p "$PG_PORT" -U postgres -q 2>/dev/null
  else
    docker run --rm postgres:16 pg_isready -h host.docker.internal -p "$PG_PORT" -U postgres -q 2>/dev/null
  fi
}

redis_is_up() {
  if command -v redis-cli &>/dev/null; then
    redis-cli -h localhost -p "$REDIS_PORT" ping 2>/dev/null | grep -q PONG
  else
    docker run --rm redis:alpine redis-cli -h host.docker.internal -p "$REDIS_PORT" ping 2>/dev/null | grep -q PONG
  fi
}

start_infra_docker_compose() {
  if docker compose -f "$COMPOSE_FILE" version &>/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" up -d db redis 2>/dev/null && return 0
  fi
  return 1
}

start_infra_fallback() {
  if ! docker inspect twenty-local-pg &>/dev/null; then
    docker run -d --name twenty-local-pg \
      -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=default \
      -p 5433:5432 postgres:16
    ok "Created twenty-local-pg on port 5433"
  else
    docker start twenty-local-pg &>/dev/null || true
  fi
  if ! docker inspect twenty-local-redis &>/dev/null; then
    docker run -d --name twenty-local-redis -p 6380:6379 redis:7 --maxmemory-policy noeviction
    ok "Created twenty-local-redis on port 6380"
  else
    docker start twenty-local-redis &>/dev/null || true
  fi
}

start_infra() {
  read_env_ports
  if pg_is_up && redis_is_up; then
    ok "Postgres ($PG_PORT) and Redis ($REDIS_PORT) already running"
    return
  fi
  info "Starting Postgres + Redis..."
  if start_infra_docker_compose; then
    sleep 3
  fi
  if ! pg_is_up || ! redis_is_up; then
    info "Compose failed or ports busy — using fallback containers (5433/6380)"
    start_infra_fallback
    sleep 3
  fi
  if ! pg_is_up || ! redis_is_up; then
    echo "FAIL: Postgres/Redis not reachable. Run: bash packages/twenty-utils/setup-dev-env.sh" >&2
    exit 1
  fi
  ok "Postgres ($PG_PORT) and Redis ($REDIS_PORT) ready"
}

stop_infra() {
  info "Stopping Postgres + Redis (Docker)..."
  docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
  docker stop twenty-local-pg twenty-local-redis 2>/dev/null || true
  ok "Infra stopped"
}

stop_all() {
  stop_app
  stop_infra
}

status() {
  read_env_ports
  echo "Ports (from packages/twenty-server/.env when present):"
  echo "  API:      $API_PORT"
  echo "  Frontend: $FRONT_PORT"
  echo "  Postgres: $PG_PORT"
  echo "  Redis:    $REDIS_PORT"
  echo ""
  for port in "$API_PORT" "$FRONT_PORT" 3002 3003; do
    if pids="$(pids_on_port "$port")"; [[ -n "$pids" ]]; then
      ok "Port $port: running (pid $pids)"
    else
      echo "   Port $port: free"
    fi
  done
  if pg_is_up; then ok "Postgres: up"; else echo "   Postgres: down"; fi
  if redis_is_up; then ok "Redis: up"; else echo "   Redis: down"; fi
}

start_app() {
  cd "$REPO_ROOT"
  if [[ ! -d node_modules ]]; then
    info "Installing dependencies..."
    yarn install
  fi
  if [[ ! -f packages/twenty-server/.env ]]; then
    info "Creating .env files..."
    npx nx reset:env twenty-server
    npx nx reset:env twenty-front
  fi
  if pids="$(pids_on_port "$API_PORT")"; [[ -n "$pids" ]]; then
    echo "FAIL: API port $API_PORT already in use. Run: $0 stop" >&2
    exit 1
  fi
  info "Starting yarn start (server + frontend + worker)..."
  export REACT_APP_PORT="${REACT_APP_PORT:-$FRONT_PORT}"
  exec yarn start
}

cmd="${1:-}"
case "$cmd" in
  start)
    start_infra
    start_app
    ;;
  stop | stop-all)
    stop_all
    ;;
  restart)
    stop_all
    start_infra
    start_app
    ;;
  status)
    status
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}" >&2
    exit 1
    ;;
esac
