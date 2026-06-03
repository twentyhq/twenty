#!/bin/sh
set -e

step_start() { echo "==> START $1"; }
step_done() { echo "==> DONE"; }

# Wait for ClickHouse HTTP to be ready (timeout after 60s)
step_start "Waiting for ClickHouse"
TRIES=0
until curl -fsS http://localhost:8123/ping > /dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 120 ]; then
    echo "ERROR: ClickHouse did not become ready within 60s"
    exit 1
  fi
  sleep 0.5
done
step_done

# Create the database + event-log tables (idempotent). Reads CLICKHOUSE_URL from env.
step_start "Running ClickHouse migrations"
cd /app/packages/twenty-server
yarn clickhouse:migrate:prod
step_done
