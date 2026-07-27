#!/bin/bash
# =============================================================================
# Alert when an installed launchd agent no longer matches the one in git.
# =============================================================================
# The launchd plists in deploy/launchd/ are the source of truth, but launchd
# reads ~/Library/LaunchAgents. Editing the repo copy changes nothing until
# someone copies it across and reloads the job — and a deploy does not do that,
# because the checkout is not the install location.
#
# That gap is silent and it bites: #17 changed the production converger's poll
# from 300s to 60s and documented `launchctl kickstart`, that PR shipped to
# production on 2026-07-26, and on 2026-07-27 the installed plist was still on
# 300s. Nothing anywhere said so.
#
# This reports three states per agent:
#   1. in git but never installed          — the job is not running at all
#   2. installed but different from git    — running config is not the reviewed one
#   3. installed and current but NOT loaded — file is right, launchd is not running it
#
# Exits non-zero and prints WARN lines when anything drifts, so cron/launchd
# surface it (and it fires a macOS notification if osascript is available).
#
# Schedule from the DEPLOY clone via cron (matches check-sync-freshness.sh):
#   0 8 * * * /bin/bash /Users/ben/Deploy/twenty/deploy/check-launchd-drift.sh >> /Users/ben/Backups/twenty/launchd-drift.log 2>&1
# Run by hand:  bash deploy/check-launchd-drift.sh
# Fix what it reports:
#   cp deploy/launchd/<label>.plist ~/Library/LaunchAgents/
#   launchctl unload ~/Library/LaunchAgents/<label>.plist 2>/dev/null
#   launchctl load   ~/Library/LaunchAgents/<label>.plist
# =============================================================================
set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/deploy/launchd"
INSTALL_DIR="${LAUNCHD_INSTALL_DIR:-$HOME/Library/LaunchAgents}"

warnings=()

shopt -s nullglob
for src in "$SRC_DIR"/*.plist; do
  name="$(basename "$src")"
  label="${name%.plist}"
  installed="$INSTALL_DIR/$name"

  if [ ! -f "$installed" ]; then
    warnings+=("$label: in git but not installed at $installed")
    continue
  fi

  if ! diff -q "$src" "$installed" >/dev/null 2>&1; then
    # Surface the fields that actually change behaviour rather than a raw diff.
    detail="$(
      diff <(grep -E '<(integer|string|true|false)' "$installed") \
           <(grep -E '<(integer|string|true|false)' "$src") |
        tr '\n' ' ' | cut -c1-160
    )"
    warnings+=("$label: installed copy differs from git — $detail")
    continue
  fi

  # The file can be correct and the job still not running.
  if command -v launchctl >/dev/null 2>&1; then
    if ! launchctl list 2>/dev/null | grep -q "[[:space:]]${label}$"; then
      warnings+=("$label: installed and current, but not loaded in launchctl")
    fi
  fi
done
shopt -u nullglob

STAMP="$(date '+%Y-%m-%d %H:%M:%S')"
if [ "${#warnings[@]}" -eq 0 ]; then
  echo "[check-launchd] $STAMP OK — every agent in $SRC_DIR is installed, current, and loaded"
  exit 0
fi

echo "[check-launchd] $STAMP ⚠️  LAUNCHD DRIFT:"
for w in "${warnings[@]}"; do echo "[check-launchd]   - $w"; done
echo "[check-launchd] Fix: cp the plist from $SRC_DIR to $INSTALL_DIR, then unload + load it."

if command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"${warnings[0]}\" with title \"Twenty launchd drift\"" \
    >/dev/null 2>&1 || true
fi

exit 1
