#!/bin/bash
# =============================================================================
# Alert if Gmail/Calendar message sync has silently stalled.
# =============================================================================
# Twenty's built-in `relaunch-failed-message-channels` cron only retries
# channels in FAILED state. It does NOT catch a channel that stays ACTIVE but
# silently imports nothing — e.g. a dead Gmail historyId cursor that makes every
# incremental fetch return "0 to import" while `syncedAt` keeps ticking. That
# exact failure hid a 13-day sync gap on 2026-07-19.
#
# This check surfaces both classes:
#   1. channels in FAILED / FAILED_UNKNOWN, or with a failed OAuth token
#   2. NO new mail imported for longer than the freshness threshold, even though
#      a real (token-bearing, sync-enabled) channel exists  ← the silent stall
#
# It also checks that a current dump has reached offsite storage, which fails the
# same silent way: backup-db.sh exits non-zero into a log nobody reads.
#
# Exits non-zero and prints WARN line(s) when unhealthy, so cron/launchd surface
# it (and it fires a macOS notification if osascript is available). Connection
# details come from packages/twenty-server/.env — no credentials in this script.
#
# Schedule from the DEPLOY clone via cron (matches backup-db.sh), e.g. hourly:
#   0 * * * * /bin/bash /Users/ben/Deploy/twenty/deploy/check-sync-freshness.sh >> /Users/ben/Backups/twenty/sync-freshness.log 2>&1
# Run by hand:  bash deploy/check-sync-freshness.sh
# Tune the thresholds:
#   TWENTY_SYNC_STALE_HOURS=24    bash deploy/check-sync-freshness.sh
#   TWENTY_BACKUP_STALE_HOURS=26  bash deploy/check-sync-freshness.sh
# Skip the offsite check entirely (dev machines):  TWENTY_BACKUP_SKIP_REMOTE=1
# =============================================================================
set -uo pipefail
export PATH="/opt/homebrew/opt/postgresql@16/bin:/opt/homebrew/bin:$PATH"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
THRESHOLD_HOURS="${TWENTY_SYNC_STALE_HOURS:-48}"

PG_URL="$(grep -E '^PG_DATABASE_URL=' "$REPO_ROOT/packages/twenty-server/.env" | head -1 | cut -d= -f2- | tr -d '"')"
if [ -z "$PG_URL" ]; then
  echo "[check-sync] FAIL: PG_DATABASE_URL not found in $REPO_ROOT/packages/twenty-server/.env"
  exit 2
fi

q() { psql "$PG_URL" -tA -c "$1" 2>/dev/null; }

warnings=()

# --- 1. real channels that are FAILED or have a broken OAuth token -----------
# "Real" = the connected account holds live OAuth credentials (demo accounts have
# null tokens), so we don't alert on the seeded apple.dev placeholders.
failed="$(q "SELECT string_agg(mc.handle||' → '||mc.\"syncStatus\", ', ')
  FROM core.\"messageChannel\" mc
  JOIN core.\"connectedAccount\" ca ON ca.id = mc.\"connectedAccountId\"
  WHERE ca.\"accessToken\" IS NOT NULL
    AND mc.\"syncStatus\" IN ('FAILED','FAILED_UNKNOWN');")"
[ -n "$failed" ] && warnings+=("message channel(s) in a failed state: $failed")

authfailed="$(q "SELECT string_agg(handle, ', ')
  FROM core.\"connectedAccount\"
  WHERE \"accessToken\" IS NOT NULL AND \"authFailedAt\" IS NOT NULL;")"
[ -n "$authfailed" ] && warnings+=("connected account(s) with failed OAuth (need reconnect): $authfailed")

# Is there at least one real, sync-enabled channel to hold to the freshness SLA?
real_active="$(q "SELECT count(*)
  FROM core.\"messageChannel\" mc
  JOIN core.\"connectedAccount\" ca ON ca.id = mc.\"connectedAccountId\"
  WHERE ca.\"accessToken\" IS NOT NULL AND ca.\"authFailedAt\" IS NULL
    AND mc.\"isSyncEnabled\" = true;")"

# --- 2. newest imported message across every workspace schema ---------------
# The workspace→schema map isn't in core.dataSource here, so scan the per-workspace
# `message` tables directly. The freshest message anywhere is the live inbox; if a
# real active channel exists but the newest mail is older than the threshold, the
# sync has silently stalled.
newest_epoch=0
newest_schema=""
newest_ts=""
while IFS= read -r sch; do
  [ -z "$sch" ] && continue
  e="$(q "SELECT COALESCE(EXTRACT(EPOCH FROM MAX(\"receivedAt\"))::bigint, 0) FROM \"$sch\".\"message\";")"
  e="${e:-0}"
  if [ "$e" -gt "$newest_epoch" ]; then
    newest_epoch="$e"; newest_schema="$sch"
    newest_ts="$(q "SELECT to_char(MAX(\"receivedAt\") AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI UTC') FROM \"$sch\".\"message\";")"
  fi
done < <(q "SELECT table_schema FROM information_schema.tables WHERE table_schema LIKE 'workspace\_%' AND table_name = 'message';")

now_epoch="$(date +%s)"
if [ "${real_active:-0}" -gt 0 ]; then
  if [ "$newest_epoch" -eq 0 ]; then
    warnings+=("no messages found in any workspace despite an active channel")
  else
    age_hours=$(( (now_epoch - newest_epoch) / 3600 ))
    if [ "$age_hours" -ge "$THRESHOLD_HOURS" ]; then
      warnings+=("newest email is ${age_hours}h old (>${THRESHOLD_HOURS}h) — sync may be stalled. Latest: ${newest_ts} in ${newest_schema}")
    fi
  fi
fi

# --- 3. is there a current dump in offsite storage? --------------------------
# Assert the outcome (a recent object in the bucket) rather than that last
# night's script exited zero. Only twenty-*.dump counts, so unrelated objects
# under daily/ cannot make a stalled backup look healthy.
BACKUP_STALE_HOURS="${TWENTY_BACKUP_STALE_HOURS:-26}"
R2_CONFIG="${TWENTY_R2_CONFIG:-$HOME/.config/twenty-production/r2.env}"
backup_status="skipped"
if [ "${TWENTY_BACKUP_SKIP_REMOTE:-0}" = "1" ]; then
  :
elif ! command -v rclone >/dev/null 2>&1; then
  warnings+=("rclone is not installed, so offsite backups cannot be verified")
elif [ ! -r "$R2_CONFIG" ]; then
  warnings+=("no readable R2 config at $R2_CONFIG — offsite backups cannot be verified")
else
  set -a
  . "$R2_CONFIG"
  set +a
  # lsl prints "size YYYY-MM-DD HH:MM:SS.ffffff path"; the timestamps are UTC.
  newest_dump="$(rclone lsl "r2:${TWENTY_BACKUP_BUCKET}/daily/" 2>/dev/null |
    grep -E 'twenty-[0-9].*\.dump$' | awk '{print $2" "$3}' | cut -d. -f1 | sort | tail -1)"
  if [ -z "$newest_dump" ]; then
    warnings+=("no dump found in r2:${TWENTY_BACKUP_BUCKET}/daily/ — nothing is backed up offsite")
  else
    backup_epoch="$(TZ=UTC date -j -f '%Y-%m-%d %H:%M:%S' "$newest_dump" +%s 2>/dev/null || echo 0)"
    backup_age=$(( (now_epoch - backup_epoch) / 3600 ))
    if [ "$backup_epoch" -eq 0 ]; then
      warnings+=("could not parse the newest offsite dump timestamp ('$newest_dump')")
    elif [ "$backup_age" -ge "$BACKUP_STALE_HOURS" ]; then
      warnings+=("newest offsite dump is ${backup_age}h old (>${BACKUP_STALE_HOURS}h) — uploads may have stopped")
    else
      backup_status="${backup_age}h old"
    fi
  fi
fi

# --- report -----------------------------------------------------------------
STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
if [ "${#warnings[@]}" -eq 0 ]; then
  age_hours=$(( (now_epoch - newest_epoch) / 3600 ))
  echo "[check-sync] $STAMP OK — newest email ${age_hours}h old (${newest_ts:-n/a}), ${real_active:-0} active real channel(s), offsite backup ${backup_status}"
  exit 0
fi

echo "[check-sync] $STAMP ⚠️  SYNC HEALTH WARNING:"
for w in "${warnings[@]}"; do echo "[check-sync]   - $w"; done
echo "[check-sync] Likely fix: bash deploy/update-after-merge.sh (drift), or reset the channel:"
echo "[check-sync]   cd packages/twenty-server && node dist/command/command.js messaging:reset-channel -w <workspaceId> -c <channelId>"

# Best-effort desktop notification (no-op/harmless if unavailable, e.g. headless cron).
if command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"${warnings[0]}\" with title \"Twenty CRM sync warning\"" >/dev/null 2>&1 || true
fi

exit 1
