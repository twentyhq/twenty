#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# setup-droplet.sh
# Bootstrap de produccion para Twenty (crm_sf) en un droplet de DigitalOcean.
#
# Configura un droplet VACIO en una sola corrida (idempotente):
#   - Instala Docker + compose plugin
#   - Crea swap de 2GB
#   - Abre firewall (SSH, 80, 443)
#   - Genera /opt/twenty/.env con secretos aleatorios (solo si no existe)
#   - Hace login a GHCR, baja la imagen y levanta el stack
#     (server + worker + Postgres + Redis + Caddy con SSL automatico)
#
# USO (como root en el droplet):
#   1. Sube la carpeta deploy:   scp -r deploy root@157.230.52.8:/opt/twenty
#   2. Conectate:                ssh root@157.230.52.8
#   3. Ejecuta:
#        GHCR_USER=tu_usuario_github GHCR_TOKEN=tu_pat bash /opt/twenty/setup-droplet.sh
#
# Re-ejecutarlo es seguro: NO rota secretos ni borra datos.
# ============================================================================

DEPLOY_DIR="/opt/twenty"
DOMAIN="parks.bridgehub.mx"
SERVER_URL="https://${DOMAIN}"
IMAGE="ghcr.io/bridgestudio-mx/crm_sf"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() { echo -e "\n\033[1;32m==> $*\033[0m"; }
warn() { echo -e "\033[1;33m[!] $*\033[0m"; }

# ----------------------------------------------------------------------------
# 0. Verificaciones
# ----------------------------------------------------------------------------
if [ "$(id -u)" -ne 0 ]; then
  echo "Este script debe correr como root." >&2
  exit 1
fi

# ----------------------------------------------------------------------------
# 1. Docker + compose plugin
# ----------------------------------------------------------------------------
if command -v docker >/dev/null 2>&1; then
  log "Docker ya instalado, omito."
else
  log "Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
fi

# ----------------------------------------------------------------------------
# 2. Swap de 2GB (da margen aunque el droplet tenga 4GB)
# ----------------------------------------------------------------------------
if swapon --show 2>/dev/null | grep -q '/swapfile'; then
  log "Swap ya configurado, omito."
else
  log "Creando swap de 2GB..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ----------------------------------------------------------------------------
# 3. Firewall (SSH + HTTP + HTTPS)
# ----------------------------------------------------------------------------
if command -v ufw >/dev/null 2>&1; then
  log "Configurando firewall (ufw)..."
  ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22 >/dev/null 2>&1 || true
  ufw allow 80 >/dev/null 2>&1 || true
  ufw allow 443 >/dev/null 2>&1 || true
  ufw --force enable >/dev/null 2>&1 || true
else
  warn "ufw no esta disponible; configura el firewall manualmente (22, 80, 443)."
fi

# ----------------------------------------------------------------------------
# 4. Carpeta de deploy y archivos de compose
# ----------------------------------------------------------------------------
log "Preparando $DEPLOY_DIR..."
mkdir -p "$DEPLOY_DIR"
if [ "$SCRIPT_DIR" != "$DEPLOY_DIR" ]; then
  cp "$SCRIPT_DIR/docker-compose.yml" "$DEPLOY_DIR/"
  cp "$SCRIPT_DIR/Caddyfile" "$DEPLOY_DIR/"
fi

# ----------------------------------------------------------------------------
# 5. .env (genera secretos aleatorios solo si no existe)
# ----------------------------------------------------------------------------
ENV_FILE="$DEPLOY_DIR/.env"
# Si subiste deploy/.env junto a la carpeta, se respeta. Si no, lo generamos.
if [ ! -f "$ENV_FILE" ] && [ -f "$SCRIPT_DIR/.env" ] && [ "$SCRIPT_DIR" != "$DEPLOY_DIR" ]; then
  cp "$SCRIPT_DIR/.env" "$ENV_FILE"
fi

if [ -f "$ENV_FILE" ]; then
  log ".env ya existe en $DEPLOY_DIR, conservo los secretos actuales."
else
  log "Generando $ENV_FILE con secretos aleatorios..."
  PG_USER="twenty_$(openssl rand -hex 4)"      # usuario aleatorio
  PG_PASS="$(openssl rand -hex 24)"            # hex: sin simbolos (va en una URL)
  ENC_KEY="$(openssl rand -base64 32)"
  cat > "$ENV_FILE" <<EOF
TAG=latest
SERVER_URL=${SERVER_URL}
PG_DATABASE_USER=${PG_USER}
PG_DATABASE_PASSWORD=${PG_PASS}
ENCRYPTION_KEY=${ENC_KEY}
EOF
  chmod 600 "$ENV_FILE"
fi

# ----------------------------------------------------------------------------
# 6. Login a GHCR (para bajar la imagen privada)
# ----------------------------------------------------------------------------
if [ -n "${GHCR_USER:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  log "Login a GHCR como $GHCR_USER..."
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
else
  warn "GHCR_USER/GHCR_TOKEN no definidos. Haz login manual antes de continuar:"
  warn "  echo TU_PAT | docker login ghcr.io -u TU_USUARIO --password-stdin"
fi

# ----------------------------------------------------------------------------
# 7. Arrancar el stack
# ----------------------------------------------------------------------------
cd "$DEPLOY_DIR"
log "Bajando imagenes..."
if ! docker compose pull; then
  warn "No se pudo bajar la imagen $IMAGE."
  warn "Probablemente aun no existe en GHCR: haz un push a 'main' (o corre el"
  warn "workflow 'Deploy to droplet') para construirla, luego re-ejecuta este script."
  exit 1
fi

log "Levantando contenedores..."
docker compose up -d

log "Listo. Estado:"
docker compose ps

cat <<EOF

----------------------------------------------------------------------------
 SIGUIENTE PASO MANUAL (fuera del droplet):
 - DNS: crea el registro A   ${DOMAIN} -> $(curl -s ifconfig.me 2>/dev/null || echo 'IP_DEL_DROPLET')
   Caddy emite el certificado SSL automaticamente cuando el DNS apunte aqui.
 - Logs del server:  cd ${DEPLOY_DIR} && docker compose logs -f server
----------------------------------------------------------------------------
EOF
