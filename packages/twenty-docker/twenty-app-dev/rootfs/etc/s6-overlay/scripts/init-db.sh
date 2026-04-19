#!/bin/sh
set -e

step_start() { echo "==> START $1"; }
step_done() { echo "==> DONE"; }

# Wait for PostgreSQL to be ready (timeout after 60s)
step_start "Waiting for PostgreSQL"
TRIES=0
until su-exec postgres pg_isready -h localhost > /dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 120 ]; then
    echo "ERROR: PostgreSQL did not become ready within 60s"
    exit 1
  fi
  sleep 0.5
done
step_done

# Create role if it doesn't exist
su-exec postgres psql -h localhost -tc \
  "SELECT 1 FROM pg_roles WHERE rolname='twenty'" | grep -q 1 \
  || su-exec postgres psql -h localhost -c "CREATE ROLE twenty WITH LOGIN PASSWORD 'twenty' SUPERUSER"

# Create database if it doesn't exist
su-exec postgres psql -h localhost -tc \
  "SELECT 1 FROM pg_database WHERE datname='default'" | grep -q 1 \
  || su-exec postgres createdb -h localhost -O twenty default

# Run Twenty database setup and migrations
cd /app/packages/twenty-server

has_schema=$(PGPASSWORD=twenty psql -h localhost -U twenty -d default -tAc \
  "SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'core')")

if [ "$has_schema" = "f" ]; then
  step_start "Running initial database setup"
  NODE_OPTIONS="--max-old-space-size=1500" node ./dist/database/scripts/setup-db.js
  step_done
fi

step_start "Running migrations"
yarn database:migrate:prod --force
step_done

step_start "Flushing cache"
yarn command:prod cache:flush
step_done

step_start "Running upgrade"
yarn command:prod upgrade
step_done

step_start "Flushing cache"
yarn command:prod cache:flush
step_done

# Only seed on first boot — check if the dev workspace already exists
has_workspace=$(PGPASSWORD=twenty psql -h localhost -U twenty -d default -tAc \
  "SELECT EXISTS (SELECT 1 FROM core.workspace WHERE id = '20202020-1c25-4d02-bf25-6aeccf7ea419')")

if [ "$has_workspace" = "f" ]; then
  step_start "Seeding workspace data"
  yarn command:prod workspace:seed:dev --light || true
  step_done
fi

echo "==> START Database ready"
echo "==> DONE"
