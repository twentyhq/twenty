#!/usr/bin/env bash
# Usage: init-env.sh <domain> [https-port]
# Writes ops/.env (mode 600, gitignored) with freshly generated secrets.
set -euo pipefail

domain="${1:?usage: init-env.sh <domain> [https-port]}"
https_port="${2:-443}"
env_file="$(dirname "$0")/../.env"

[ -e "$env_file" ] && { echo "$env_file already exists, refusing to overwrite" >&2; exit 1; }

server_url="https://${domain}"
[ "$https_port" != "443" ] && server_url="${server_url}:${https_port}"

umask 077
cat > "$env_file" <<EOF
TAG=v2.41.0
DOMAIN=${domain}
HTTP_PORT=$([ "$https_port" = "443" ] && echo 80 || echo 8080)
HTTPS_PORT=${https_port}
SERVER_URL=${server_url}
PG_DATABASE_NAME=default
PG_DATABASE_USER=twenty
PG_DATABASE_PASSWORD=$(openssl rand -hex 24)
ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF
echo "wrote $env_file"
