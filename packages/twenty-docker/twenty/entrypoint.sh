#!/bin/sh
set -e

validate_workspace_manifest() {
    manifest_path="$1"

    if [ ! -s "${manifest_path}" ]; then
        echo "ERROR: Invalid runtime workspace manifest (missing or empty): ${manifest_path}" >&2
        return 1
    fi

    if ! node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'))" "${manifest_path}" >/dev/null 2>&1; then
        echo "ERROR: Invalid runtime workspace manifest (malformed JSON): ${manifest_path}" >&2
        return 1
    fi
}

validate_workspace_manifests() {
    validate_workspace_manifest "/app/packages/twenty-shared/package.json" || return 1
    validate_workspace_manifest "/app/packages/twenty-server/package.json" || return 1
    validate_workspace_manifest "/app/packages/twenty-emails/package.json" || return 1
    validate_workspace_manifest "/app/packages/twenty-client-sdk/package.json" || return 1
}

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

    if ! yarn command:prod upgrade; then
        echo "Warning: Upgrade completed with errors. Some workspaces may not be fully migrated. Check logs for details."
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

if ! validate_workspace_manifests; then
    echo "ERROR: Aborting startup because runtime workspace manifests are invalid." >&2
    exit 1
fi

setup_and_migrate_db
register_background_jobs

# Continue with the original Docker command
exec "$@"
