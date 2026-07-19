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
    # healthy). The upgrade command decides what counts as fatal:
    #   - instance/schema failures always fail (they affect every workspace);
    #   - workspace-scoped failures fail on a single-workspace instance
    #     (IS_MULTIWORKSPACE_ENABLED=false), but are tolerated (exit 0, surfaced
    #     via upgrade status) on a multi-workspace instance so one bad tenant
    #     does not take healthy ones offline;
    #   - UPGRADE_CONTINUE_ON_ERROR=true forces the tolerant behaviour.
    # So a non-zero exit here means "do not serve" -> abort startup.
    if ! yarn command:prod upgrade; then
        echo "ERROR: Database upgrade failed. Aborting startup to avoid serving a half-migrated/broken schema. See the upgrade logs above." >&2
        exit 1
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
