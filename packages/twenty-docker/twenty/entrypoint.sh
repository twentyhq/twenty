#!/bin/sh
set -e

# Warn if deprecated STORAGE_LOCAL_PATH is set
if [ -n "$STORAGE_LOCAL_PATH" ]; then
  echo "WARNING: The STORAGE_LOCAL_PATH environment variable is deprecated and no longer used. The local storage path is fixed to /app/packages/twenty-server/.local-storage."
fi

# Extract database connection details from the connection string
PGUSER=$(echo $PG_DATABASE_URL | awk -F '//' '{print $2}' | awk -F ':' '{print $1}')
PGPASS=$(echo $PG_DATABASE_URL | awk -F ':' '{print $3}' | awk -F '@' '{print $1}')
PGHOST=$(echo $PG_DATABASE_URL | awk -F '@' '{print $2}' | awk -F ':' '{print $1}')
PGPORT=$(echo $PG_DATABASE_URL | awk -F ':' '{print $4}' | awk -F '/' '{print $1}')
PGDATABASE=$(echo $PG_DATABASE_URL | awk -F ':' '{print $4}' | awk -F '/' '{print $2}')

# Create database if it doesn't exist
PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${PGDATABASE}'" | grep -q 1 || \
PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -c "CREATE DATABASE \"${PGDATABASE}\""

# Always run setup and migrations on startup, unless explicitly disabled
if [ "${DISABLE_DB_MIGRATIONS}" != "true" ]; then
    echo "Running database setup and migrations..."
    NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
    yarn database:migrate:prod
    yarn command:prod upgrade
    echo "Database setup and migrations complete!"
fi

# Continue with the original Docker command
exec "$@"
