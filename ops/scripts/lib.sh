#!/usr/bin/env bash
OPS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$OPS_DIR/backups}"
LOG_DIR="$OPS_DIR/logs"
RESTIC_IMAGE="restic/restic:0.19.1"
RESTIC_PASSWORD_FILE="${RESTIC_PASSWORD_FILE:-$OPS_DIR/secrets/restic-password}"
COMPOSE=(docker compose --project-directory "$OPS_DIR" -f "$OPS_DIR/docker-compose.yml")

mkdir -p "$LOG_DIR" "$BACKUP_DIR"

alert() {
  echo "$(date -u +%FT%TZ) $*" | tee -a "$LOG_DIR/alerts.log" >&2
}

# Extra docker args (extra mounts) go before "--", restic args after.
restic() {
  local docker_args=()
  while [ "$1" != "--" ]; do docker_args+=("$1"); shift; done
  shift
  docker run --rm -h jai-os \
    -v "$BACKUP_DIR/restic-repo:/repo" \
    -v "$RESTIC_PASSWORD_FILE:/password:ro" \
    -e RESTIC_REPOSITORY=/repo -e RESTIC_PASSWORD_FILE=/password \
    "${docker_args[@]}" "$RESTIC_IMAGE" "$@"
}
