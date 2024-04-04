#!/bin/sh

# Check if the initialization has already been done and that we enabled automatic migration
if [ "${ENABLE_DB_MIGRATIONS}" = "true" ] && [ ! -f /app/${STORAGE_LOCAL_PATH:-.local-storage}/db_initialized ]; then
    echo "Running database setup and migrations..."

    # Run setup and migration scripts
    npx ts-node ./scripts/setup-db.ts
    yarn database:migrate:prod

    # Mark initialization as done
    echo "Successfuly migrated DB!"
    touch /app/${STORAGE_LOCAL_PATH:-.local-storage}/db_initialized
fi

# Continue with the original Docker command
exec "$@"
