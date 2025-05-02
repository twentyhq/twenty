#!/bin/sh
set -e

setup_and_migrate_db() {
    if [ "${DISABLE_DB_MIGRATIONS}" = "true" ]; then
        echo "Database setup and migrations are disabled, skipping..."
        return
    fi

    if [ ! -f /app/docker-data/db_status ]; then
        echo "Running database setup and migrations..."

        # Creating the database if it doesn't exist
        PGUSER=$(echo $PG_DATABASE_URL | awk -F '//' '{print $2}' | awk -F ':' '{print $1}')
        PGPASS=$(echo $PG_DATABASE_URL | awk -F ':' '{print $3}' | awk -F '@' '{print $1}')
        PGHOST=$(echo $PG_DATABASE_URL | awk -F '@' '{print $2}' | awk -F ':' '{print $1}')
        PGPORT=$(echo $PG_DATABASE_URL | awk -F ':' '{print $4}' | awk -F '/' '{print $1}')
        PGDATABASE=$(echo $PG_DATABASE_URL | awk -F ':' '{print $4}' | awk -F '/' '{print $2}')
        PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${PGDATABASE}'" | grep -q 1 ||
            PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -c "CREATE DATABASE \"${PGDATABASE}\""

        # Run setup and migration scripts
        NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
    fi

    yarn database:migrate:prod
    yarn command:prod upgrade

    if [ ! -f /app/docker-data/db_status ]; then
        # Mark initialization as done
        echo "Successfully migrated DB!"
        touch /app/docker-data/db_status
    fi
}
setup_and_migrate_db

# Continue with the original Docker command
exec "$@"
