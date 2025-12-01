#!/bin/sh
set -e

# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
file_env() {
	local var="$1"
	local fileVar="${var}_FILE"
	local def="${2:-}"
	if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
		printf >&2 'error: both %s and %s are set (but are exclusive)\n' "$var" "$fileVar"
		exit 1
	fi
	local val="$def"
	if [ "${!var:-}" ]; then
		val="${!var}"
	elif [ "${!fileVar:-}" ]; then
		val="$(< "${!fileVar}")"
	fi
	export "$var"="$val"
	unset "$fileVar"
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
        NODE_OPTIONS="--max-old-space-size=1500" tsx ./scripts/setup-db.ts
        yarn database:migrate:prod
    fi

    yarn command:prod upgrade
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

docker_setup_env() {
  # Initialize values that might be stored in a file
  local env_vars=(
    'PG_DATABASE_URL'
    'REDIS_URL'
    'SERVER_URL'
    'APP_SECRET'
    'AUTH_GOOGLE_CLIENT_ID'
    'AUTH_GOOGLE_CLIENT_SECRET'
    'AUTH_GOOGLE_CALLBACK_URL'
    'AUTH_GOOGLE_APIS_CALLBACK_URL'
    'MESSAGING_PROVIDER_GMAIL_CALLBACK_URL'
    'SUPPORT_FRONT_HMAC_KEY'
    'SUPPORT_FRONT_CHAT_ID'
    'AUTH_MICROSOFT_CLIENT_ID'
    'AUTH_MICROSOFT_CLIENT_SECRET'
    'AUTH_MICROSOFT_CALLBACK_URL'
    'AUTH_MICROSOFT_APIS_CALLBACK_URL'
    'CAPTCHA_SITE_KEY'
    'CAPTCHA_SECRET_KEY'
    'ENTERPRISE_KEY'
    'CLOUDFLARE_API_KEY'
    'CLOUDFLARE_ZONE_ID'
    'CLOUDFLARE_WEBHOOK_SECRET'
    'CLICKHOUSE_URL'
  )
  for var in "${env_vars[@]}"; do
    file_env "$var"
  done
}

docker_setup_env
setup_and_migrate_db
register_background_jobs

# Continue with the original Docker command
exec "$@"
