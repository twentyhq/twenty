#!/bin/sh
set -e

setup_and_migrate_db() {
    if [ "${DISABLE_DB_MIGRATIONS}" = "true" ]; then
        echo "Database setup and migrations are disabled, skipping..."
        return
    fi

    echo "Running database setup and migrations..."

    # Validate PG_DATABASE_URL is set
    if [ -z "${PG_DATABASE_URL}" ]; then
        echo "ERROR: PG_DATABASE_URL environment variable is not set!"
        echo "Please set PG_DATABASE_URL to your PostgreSQL connection string."
        echo "Example: postgres://user:password@host:port/database"
        exit 1
    fi

    echo "Checking database connection..."
    echo "Using database URL: ${PG_DATABASE_URL%%:*}://***:***@${PG_DATABASE_URL##*@}"
    echo "rest is commented out. If migrations are necessary run them manually"

    # Run setup and migration scripts
    # has_schema=$(psql "${PG_DATABASE_URL}" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'core')" 2>&1)

    # if [ $? -ne 0 ]; then
    #     echo "ERROR: Failed to connect to database"
    #     echo "Connection error: $has_schema"
    #     echo "Please verify:"
    #     echo "  1. PG_DATABASE_URL is correct"
    #     echo "  2. Database server is accessible"
    #     echo "  3. Database credentials are valid"
    #     exit 1
    # fi

    # if [ "$has_schema" = "f" ]; then
    #     echo "Database appears to be empty, running migrations."
    #     NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
    #     yarn database:migrate:prod
    # else
    #     echo "Database schema exists, running upgrade..."
    # fi

    # yarn command:prod upgrade
    # echo "Successfully migrated DB!"
}

register_background_jobs() {
    if [ "${DISABLE_CRON_JOBS_REGISTRATION}" = "true" ]; then
        echo "Cron job registration is disabled, skipping..."
        return
    fi

    echo "Registering background sync jobs..."
    if yarn command:prod cron:register:all; then
        echo "Successfully registered all background sync jobs!"
    else
        echo "Warning: Failed to register background jobs, but continuing startup..."
    fi
}

setup_and_migrate_db
register_background_jobs

# Continue with the original Docker command
exec "$@"
