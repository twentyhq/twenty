#!/bin/sh
set -e

echo "Entrypoint script iniciado..."

# Verificar variável de ambiente obrigatória
if [ -z "$PG_DATABASE_URL" ]; then
  echo "Erro: A variável PG_DATABASE_URL não está definida."
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

    echo "Conectando ao banco: host=${PGHOST}, port=${PGPORT}, user=${PGUSER}, db=${PGDB}"

    # Criar banco de dados se não existir
    if ! PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${PGDB}'" | grep -q 1; then
        echo "Banco de dados não encontrado. Criando o banco ${PGDB}..."
        PGPASSWORD=${PGPASS} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d postgres -c "CREATE DATABASE \"${PGDB}\""
    else
        echo "Banco de dados já existe."
    fi

    # Run setup and migration scripts
    echo "Rodando migrações..."
    NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
    yarn database:migrate:prod

    # Mark initialization as done
    echo "Successfuly migrated DB!"
    touch /app/docker-data/db_status
else
  echo "DB migrations desabilitadas."
fi

# Continue with the original Docker command
echo "Executando o comando original: $@"
exec "$@"
