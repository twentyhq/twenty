#!/bin/bash
# =============================================================================
# Bring the local backend in sync with the code after a git pull/merge.
# =============================================================================
# After merging upstream, the backend can declare new NON-NULLABLE GraphQL
# fields whose DB columns / cached metadata don't exist yet. The app then boots
# to a BLANK SCREEN with, e.g.:
#     Cannot return null for non-nullable field View.isActive
#     Cannot return null for non-nullable field CommandMenuItem.isActive
#
# Fixing it needs FOUR steps (the migration alone is not enough):
#   0. yarn install                — install any new deps the upstream bump added
#                                    (else build/migrate crash with MODULE_NOT_FOUND).
#   1. database:migrate            — apply pending INSTANCE-command migrations
#                                    that ADD the new columns (fast instance cmds).
#   2. upgrade                     — run pending WORKSPACE upgrade commands (a
#                                    separate class migrate does NOT run). These
#                                    add per-workspace metadata like message.isDraft;
#                                    skipping them silently breaks sync/features.
#   3. cache:flat-cache-invalidate — drop stale flat-entity maps in Redis so the
#                                    "overridable entities" (View, CommandMenuItem,
#                                    ...) are rebuilt from the new schema. Without
#                                    this the resolver keeps returning null even
#                                    though the column now exists.
#
# Idempotent and safe to run anytime. Runs automatically via the git post-merge
# hook (.git/hooks/post-merge), or run it by hand:  bash deploy/update-after-merge.sh
# The always-on backend (watch mode) picks up the new schema on the next request
# — no restart needed.
# =============================================================================
set -uo pipefail

export PATH="/opt/homebrew/bin:/opt/homebrew/opt/postgresql@16/bin:$PATH"
eval "$(fnm env --shell bash)" 2>/dev/null || true
fnm use 24.5.0 >/dev/null 2>&1 || true

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# This script migrates whatever PG_DATABASE_URL points at, and on this Mac every
# checkout's .env points at the same localhost:5432/default — the live CRM. The
# post-merge hook routes on changed file paths, not on which checkout it fired
# in, so without this guard a plain `git pull` in an ops or scratch clone runs
# production migrations. That has already happened once; it was harmless only
# because nothing was pending.
PRODUCTION_ROOT="${TWENTY_PRODUCTION_ROOT:-/Users/ben/Deploy/twenty}"
if [ "$REPO_ROOT" != "$PRODUCTION_ROOT" ]; then
  echo "[update-after-merge] refusing to run: this is not the production checkout"
  echo "[update-after-merge]   here:       $REPO_ROOT"
  echo "[update-after-merge]   production: $PRODUCTION_ROOT"
  echo "[update-after-merge] developer machines use: bash deploy/local-schema.sh sync"
  exit 0
fi

# Datastores must be up; if not, bail with a clear message instead of hanging.
if ! pg_isready -h localhost -p 5432 -q 2>/dev/null; then
  echo "[update-after-merge] Postgres not up on :5432 — start it (brew services start postgresql@16), then re-run: bash deploy/update-after-merge.sh"
  exit 0
fi
if ! redis-cli -h localhost -p 6379 ping 2>/dev/null | grep -q PONG; then
  echo "[update-after-merge] Redis not up on :6379 — start it (brew services start redis), then re-run: bash deploy/update-after-merge.sh"
  exit 0
fi

# 0. Install deps FIRST. Upstream bumps frequently add new packages (e.g. the
#    v2.18.0 CalDAV driver pulled in ical-generator); without this the build +
#    migrate crash with MODULE_NOT_FOUND and the backend crash-loops.
echo "[update-after-merge] 1/4 installing dependencies (yarn install)..."
if ! yarn install; then
  echo "[update-after-merge] yarn install FAILED (see output above)"; exit 1
fi

echo "[update-after-merge] 2/4 applying pending DB instance-command migrations..."
if ! npx nx run twenty-server:database:migrate; then
  echo "[update-after-merge] database:migrate FAILED (see output above)"; exit 1
fi

# database:migrate above runs INSTANCE commands only. Per-workspace upgrade:*
# commands (@RegisteredWorkspaceCommand — they add/backfill per-workspace metadata
# like message.isDraft or new enum options) are a SEPARATE class it never runs.
# Skipping them silently drifts the workspace schema behind the code and breaks
# features weeks later — e.g. a missing message.isDraft field killed ALL Gmail
# import for ~2 weeks (2026-07-19). `upgrade` runs the full instance+workspace
# sequence (idempotent) and exits non-zero if ANY workspace step fails.
echo "[update-after-merge] 3/4 running pending workspace upgrade commands..."
if ! npx nx run twenty-server:command -- upgrade; then
  echo "[update-after-merge] workspace upgrade FAILED — schema still drifted (see output above)"; exit 1
fi

echo "[update-after-merge] 4/4 invalidating stale flat-entity cache (Redis)..."
if ! npx nx run twenty-server:command -- cache:flat-cache-invalidate --all-metadata; then
  echo "[update-after-merge] cache:flat-cache-invalidate FAILED (see output above)"; exit 1
fi

echo "[update-after-merge] done — backend will serve the new schema on the next request."
echo "[update-after-merge] (FRONTEND changes still need a republish: bash deploy/publish-frontend.sh)"
