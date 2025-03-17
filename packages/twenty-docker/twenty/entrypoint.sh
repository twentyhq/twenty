#!/bin/sh
set -e

echo "Entrypoint script starting..."

# Verificar variável de ambiente obrigatória
if [ -z "$PG_DATABASE_URL" ]; then
  echo "Erro: The variable 'PG_DATABASE_URL' ist not defined."
  exit 1
fi

# Check if the initialization has already been done and that we enabled automatic migration
if [ "${DISABLE_DB_MIGRATIONS}" != "true" ] && [ ! -f /app/docker-data/db_status ]; then
    echo "Running database setup and migrations..."

    # Parsing PG_DATABASE_URL
    PGUSER=$(echo $PG_DATABASE_URL | awk -F '//' '{print $2}' | awk -F ':' '{print $1}')
    PGPASS=$(echo $PG_DATABASE_URL | awk -F ':' '{print $3}' | awk -F '@' '{print $1}')
    PGHOST=$(echo $PG_DATABASE_URL | awk -F '@' '{print $2}' | awk -F ':' '{print $1}')
    PGPORT=$(echo $PG_DATABASE_URL | awk -F ':' '{print $4}' | awk -F '/' '{print $1}')
    PGDB=$(echo $PG_DATABASE_URL | awk -F '/' '{print $NF}')

    echo "Connecting to db: host=${PGHOST}, port=${PGPORT}, user=${PGUSER}, db=${PGDB}"

    # Criar banco de dados se não existir
    if ! PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${PGDB}'" | grep -q 1; then
        echo "Db not found. Creating ${PGDB}..."
        PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -c "CREATE DATABASE \"${PGDB}\""
        # Run setup and migration and seed scripts
        echo "Running database setup..."
        NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
        echo "Running migrations..."
        
        if ! yarn database:migrate:prod; then
          echo "Migrations faild."
          exit 1
        fi

        touch /app/docker-data/db_status
        echo "Successfuly migrated DB!"
    else
        echo "Database ${PGDB} already exist."
        echo "Running migrations..."
        NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
        
        if ! yarn database:migrate:prod; then
          echo "Migrations faild."
          exit 1
        fi
        
        echo "Successfuly migrated DB!"
    fi
else
  echo "DB migrations disabled."
fi

# Continue with the original Docker command
echo "Executando o comando original: $@"
exec "$@"
