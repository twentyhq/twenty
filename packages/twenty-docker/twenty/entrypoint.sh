#!/bin/sh
set -e

setup_and_migrate_db() {
    if [ "${DISABLE_DB_MIGRATIONS}" = "true" ]; then
        echo "Database setup and migrations are disabled, skipping..."
        return
    fi

    echo "Running database setup and migrations..."

    # Run setup and migration scripts
    has_schema=$(psql -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'core')" ${PG_DATABASE_URL})
    if [ "$has_schema" = "f" ]; then
        echo "Database appears to be empty, running migrations."
        yarn database:init:prod
    fi

    if ! yarn command:prod cache:flush; then
        echo "Warning: Failed to flush cache before upgrade, but continuing startup..."
    fi

    # Fail-closed: a failed upgrade must abort startup rather than serve a
    # half-migrated schema (missing columns -> live 500s while the deploy looks
    # healthy). Opt out with UPGRADE_CONTINUE_ON_ERROR=true to keep the previous
    # soft-fail behaviour.
    if ! yarn command:prod upgrade; then
        if [ "${UPGRADE_CONTINUE_ON_ERROR}" = "true" ]; then
            echo "Warning: Upgrade completed with errors; continuing because UPGRADE_CONTINUE_ON_ERROR=true. Some workspaces may not be fully migrated. Check logs for details."
        else
            echo "ERROR: Upgrade failed. Aborting startup to avoid serving a half-migrated schema. Set UPGRADE_CONTINUE_ON_ERROR=true to override."
            exit 1
        fi
    fi

    if ! yarn command:prod cache:flush; then
        echo "Warning: Failed to flush cache after upgrade, but continuing startup..."
    fi

    echo "Successfully migrated DB!"
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
