#!/usr/bin/env bash
# Cron this every 5 minutes. Problems go to ops/logs/alerts.log until Telegram exists (Phase 2).
source "$(dirname "$0")/lib.sh"
problems=0
fail() { alert "$*"; problems=1; }

disk=$(df --output=pcent / | tail -1 | tr -dc 0-9)
[ "$disk" -lt 85 ] || fail "disk ${disk}% full"

mem_free=$(awk '/MemAvailable/ {a=$2} /MemTotal/ {t=$2} END {print int(a*100/t)}' /proc/meminfo)
[ "$mem_free" -gt 10 ] || fail "only ${mem_free}% memory available"

for service in caddy server worker db redis; do
  state=$("${COMPOSE[@]}" ps --format '{{.Health}}{{.State}}' "$service" 2>/dev/null | head -1)
  case "$state" in
    healthy*|running) ;;
    *) fail "service $service is not healthy (state: ${state:-missing})" ;;
  esac
done

last_success="$BACKUP_DIR/last-success"
if [ ! -f "$last_success" ] || [ -n "$(find "$last_success" -mmin +2160)" ]; then
  fail "no successful backup in the last 36h"
fi

exit "$problems"
