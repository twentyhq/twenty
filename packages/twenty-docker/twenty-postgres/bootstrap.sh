#!/bin/bash
# shellcheck disable=SC2154

# Executed at container start to bootstrap ParadeDB extensions and Postgres settings.

# Exit on subcommand errors
set -Eeuo pipefail

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

# The `pg_cron` extension can only be installed in the `postgres` database, as per
# our configuration in our Dockerfile. Therefore, we install it separately here.
psql -d postgres -c "CREATE EXTENSION IF NOT EXISTS pg_cron;"

# Load ParadeDB and third-party extensions into $POSTGRES_DB
echo "Loading ParadeDB extensions into $POSTGRES_DB"
psql -d "$POSTGRES_DB" <<-'EOSQL'
    CREATE EXTENSION IF NOT EXISTS pg_search;
    CREATE EXTENSION IF NOT EXISTS pg_analytics;
    CREATE EXTENSION IF NOT EXISTS pg_ivm;
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS vectorscale;
EOSQL

# Add the `paradedb` schema to $POSTGRES_DB
echo "Adding 'paradedb' search_path to $POSTGRES_DB"
psql -d "$POSTGRES_DB" -c "ALTER DATABASE \"$POSTGRES_DB\" SET search_path TO public,paradedb;"

echo "ParadeDB bootstrap completed!"