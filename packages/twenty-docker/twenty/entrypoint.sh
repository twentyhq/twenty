#!/bin/sh
set -e

setup_and_migrate_db() {
    if [ "${DISABLE_DB_MIGRATIONS}" = "true" ]; then
        echo "Database setup and migrations are disabled, skipping..."
        return
    fi

    echo "Running database setup and migrations..."
    PGUSER=$(echo $PG_DATABASE_URL | awk -F '//' '{print $2}' | awk -F ':' '{print $1}')
    PGPASS=$(echo $PG_DATABASE_URL | awk -F ':' '{print $3}' | awk -F '@' '{print $1}')
    PGHOST=$(echo $PG_DATABASE_URL | awk -F '@' '{print $2}' | awk -F ':' '{print $1}')
    PGPORT=$(echo $PG_DATABASE_URL | awk -F ':' '{print $4}' | awk -F '/' '{print $1}')
    PGDATABASE=$(echo $PG_DATABASE_URL | awk -F ':' '{print $4}' | awk -F '/' '{print $2}')

    # Creating the database if it doesn't exist
    db_count=$(PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -tAc "SELECT COUNT(*) FROM pg_database WHERE datname = '${PGDATABASE}'")
    if [ "$db_count" = "0" ]; then
        echo "Database ${PGDATABASE} does not exist, creating..."
        PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -c "CREATE DATABASE \"${PGDATABASE}\""

        # Run setup and migration scripts
        NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
    fi
    
    yarn database:migrate:prod
    yarn command:prod upgrade
    echo "Successfully migrated DB!"
}
setup_and_migrate_db

# Continue with the original Docker command
exec "$@"
