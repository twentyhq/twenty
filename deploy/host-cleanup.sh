#!/bin/bash
set -euo pipefail

# Daily housekeeping for the Mac that runs production and staging.
#
# Two things here grow without limit and nothing else reclaims them: the launchd
# job logs in /tmp, and untagged Docker images left behind by builds and by
# retagged pulls. Neither is anyone's job today, so both accumulate until
# something breaks. The images matter most, because they share a fixed-size
# volume with staging's own images, and a full volume fails every staging deploy
# partway through unpacking.
#
# Deliberately scoped and boring. It deletes only what it can identify, and it
# does not touch Docker volumes at all; see the note at the bottom of this file.

LOG_PREFIX="[host-cleanup]"

# Rotate a log once it passes this, keeping one compressed generation.
MAX_LOG_MB="${TWENTY_MAX_LOG_MB:-20}"

# Only sweep untagged images older than this. A build running right now leaves
# untagged intermediates that it still needs.
DANGLING_MIN_AGE="${TWENTY_DANGLING_MIN_AGE:-24h}"

# The images this fork and upstream both publish carry this. Scoping the sweep
# to it keeps the prune off images belonging to anything else on this daemon.
IMAGE_LABEL="org.opencontainers.image.source=https://github.com/twentyhq/twenty"

# This script's own log, excluded from rotation: truncating a file while our
# stdout still points into it is how you get a multi-gigabyte sparse file.
SELF_LOG="/tmp/twenty-host-cleanup.log"

log() {
  echo "$LOG_PREFIX $(date -u +%Y-%m-%dT%H:%M:%SZ) $*"
}

rotate_log() {
  local file="$1" size_mb
  [ -f "$file" ] || return 0

  size_mb=$(($(wc -c <"$file" | tr -d ' ') / 1048576))
  [ "$size_mb" -ge "$MAX_LOG_MB" ] || return 0

  # Copy and truncate in place rather than renaming. launchd holds an open
  # descriptor on these for the long-running jobs, so a renamed file keeps
  # collecting their output at an inode nothing will ever read again.
  if ! gzip -c "$file" >"${file}.1.gz" 2>/dev/null; then
    log "could not compress ${file}; leaving it alone"
    return 0
  fi
  : >"$file"
  log "rotated ${file} (${size_mb}MB) into ${file}.1.gz"
}

rotate_logs() {
  local file found=0
  shopt -s nullglob
  for file in /tmp/twenty-*.log; do
    [ "$file" = "$SELF_LOG" ] && continue
    rotate_log "$file"
    found=1
  done
  shopt -u nullglob
  [ "$found" = 1 ] || log "no logs to consider"
}

prune_dangling_images() {
  local output reclaimed
  output="$(
    docker image prune --force \
      --filter "label=${IMAGE_LABEL}" \
      --filter "until=${DANGLING_MIN_AGE}" 2>/dev/null
  )" || {
    log "dangling image sweep failed; is the Docker daemon running?"
    return 0
  }

  reclaimed="$(printf '%s\n' "$output" | awk '/Total reclaimed space/ { print $NF }')"
  case "$reclaimed" in
    "" | 0B) : ;;
    *) log "reclaimed ${reclaimed} of untagged images older than ${DANGLING_MIN_AGE}" ;;
  esac
}

# Free space is only visible from inside a container: the images live on the
# Docker host, which here is a VM whose disk the Mac's own df cannot see. Logged
# every run so the trend is in the record before a deploy fails on it.
report_volume_usage() {
  local probe capacity
  probe="$(docker image ls --format '{{.Repository}}:{{.Tag}}' 2>/dev/null | grep -v '<none>' | head -1)"
  if [ -z "$probe" ]; then
    log "no image available to probe volume usage with"
    return 0
  fi

  capacity="$(
    docker run --rm --entrypoint df -v /var/lib/docker:/vol:ro "$probe" \
      -Ph /vol 2>/dev/null | awk 'NR == 2 { print $4 " free of " $2 " (" $5 " used)" }'
  )"
  if [ -z "$capacity" ]; then
    log "could not read Docker volume usage"
    return 0
  fi
  log "Docker volume: ${capacity}"
}

main() {
  rotate_logs
  prune_dangling_images
  report_volume_usage

  # Docker volumes are deliberately not pruned. `docker volume prune` removes
  # any volume no *container* references, and staging's database volume only
  # holds its reference while the containers exist. Run this while staging is
  # down and it deletes the staging database. If orphaned volumes need
  # collecting, do it by name, by hand, with staging up.
}

main "$@"
