#!/bin/sh
set -e

# Wait for PostgreSQL to be ready (timeout after 60s)
echo "Waiting for PostgreSQL..."
TRIES=0
until su-exec postgres pg_isready -h localhost; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -ge 120 ]; then
    echo "ERROR: PostgreSQL did not become ready within 60s"
    exit 1
  fi
  sleep 0.5
done
echo "PostgreSQL is ready."

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
  echo "Database appears to be empty, running initial setup..."
  NODE_OPTIONS="--max-old-space-size=1500" node ./dist/scripts/setup-db.js
fi

# Always run migrations (idempotent — skips already-applied ones)
yarn database:migrate:prod

yarn command:prod cache:flush
yarn command:prod upgrade
yarn command:prod cache:flush

# Only seed on first boot — check if the dev workspace already exists
has_workspace=$(PGPASSWORD=twenty psql -h localhost -U twenty -d default -tAc \
  "SELECT EXISTS (SELECT 1 FROM core.workspace WHERE id = '20202020-1c25-4d02-bf25-6aeccf7ea419')")

if [ "$has_workspace" = "f" ]; then
  echo "Seeding app dev data..."
  yarn command:prod workspace:seed:dev --light || true
else
  echo "Dev workspace already seeded, skipping."
fi

echo "Database initialization complete."
