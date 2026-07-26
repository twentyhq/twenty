#!/bin/bash
set -euo pipefail

# Converges production onto refs/heads/production-target.
#
# Runs from launchd in the production clone. Like the staging converger it only
# makes outbound calls, so nothing reaches into this machine from GitHub.
#
# Production differs from staging in three ways that matter here:
#
#   1. It runs from a git checkout, not a container, so a deploy is a
#      fast-forward rather than an image swap.
#   2. The fast-forward fires the post-merge hook, which runs migrations. That
#      hook reports failure with `|| echo` and still exits 0, so git's exit
#      code cannot be used to decide whether a deploy worked. Everything after
#      the merge here exists to answer that question independently.
#   3. Rolling back does not undo a migration, so a database-changing release
#      takes a backup first and refuses to proceed without one.

DEPLOY_ROOT="${TWENTY_PRODUCTION_ROOT:-/Users/ben/Deploy/twenty}"
STATE_FILE="/tmp/twenty-production-converge-state"
LOCK="/tmp/twenty-production-converge.lock"
LOG_PREFIX="[production-converge]"
TARGET_BRANCH="production-target"
TOKEN_FILE="${TWENTY_PRODUCTION_TOKEN_FILE:-$HOME/.config/twenty-production/github-token}"
REPO_SLUG="${TWENTY_REPO_SLUG:-SpeculativeTechnologies/CRM}"

BACKEND_HEALTH="http://127.0.0.1:3000/healthz"
FRONTEND_HEALTH="http://127.0.0.1:3010/healthz"

log() {
  echo "$LOG_PREFIX $(date -u +%Y-%m-%dT%H:%M:%SZ) $*"
}

fail() {
  echo "$LOG_PREFIX ERROR: $*" >&2
  exit 1
}

[ -d "$DEPLOY_ROOT/.git" ] || fail "No production checkout at $DEPLOY_ROOT"

if ! mkdir "$LOCK" 2>/dev/null; then
  log "another convergence is running; skipping this tick"
  exit 0
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

cd "$DEPLOY_ROOT"

git fetch --quiet origin \
  "+refs/heads/${TARGET_BRANCH}:refs/remotes/origin/${TARGET_BRANCH}" 2>/dev/null ||
  {
    log "no ${TARGET_BRANCH} ref published yet; nothing to converge"
    exit 0
  }
git fetch --quiet origin main

target_sha="$(git rev-parse "refs/remotes/origin/${TARGET_BRANCH}")"
current_sha="$(git rev-parse HEAD)"

if [ "$current_sha" = "$target_sha" ]; then
  exit 0
fi

# Refuse anything not already on main, so an approved-but-unmerged commit can
# never reach production even if the ref is moved by hand.
git merge-base --is-ancestor "$target_sha" origin/main ||
  fail "${target_sha} is not merged into main; refusing to deploy"

# Only ever move forward. Rolling back is a revert commit on main, which is
# also a fast-forward, so this does not block recovery.
git merge-base --is-ancestor "$current_sha" "$target_sha" ||
  fail "${target_sha} is not a descendant of the running commit; refusing"

report() {
  local state="$1" description="$2" deployment_id
  [ -f "$TOKEN_FILE" ] || return 0
  deployment_id="$(
    GH_TOKEN="$(cat "$TOKEN_FILE")" gh api \
      "repos/${REPO_SLUG}/deployments?environment=production&sha=${target_sha}" \
      --jq '.[0].id' 2>/dev/null || true
  )"
  [ -n "$deployment_id" ] && [ "$deployment_id" != "null" ] || return 0
  GH_TOKEN="$(cat "$TOKEN_FILE")" gh api --method POST \
    "repos/${REPO_SLUG}/deployments/${deployment_id}/statuses" \
    -f state="$state" -f description="$description" >/dev/null 2>&1 || true
}

schema_changed() {
  git diff-tree -r --name-only --no-commit-id "$current_sha" "$target_sha" |
    grep -qE 'packages/twenty-server/src/database/commands/upgrade-version-command/|\.entity\.ts$|packages/twenty-server/src/database/typeorm/'
}

log "converging ${current_sha} -> ${target_sha}"

if schema_changed; then
  log "schema files changed; taking a backup before deploying"
  if ! bash "$DEPLOY_ROOT/deploy/backup-db.sh"; then
    report failure "backup failed; deploy aborted"
    fail "backup-db.sh failed; refusing to deploy a schema change without one"
  fi
  log "backup completed"
fi

# The post-merge hook runs inside this merge and does the migration work. Its
# output is captured because its exit code is not trustworthy.
merge_output="$(git merge --ff-only "$target_sha" 2>&1)" || {
  log "$merge_output"
  report failure "fast-forward to ${target_sha} failed"
  fail "git merge --ff-only failed"
}
log "$merge_output"

# This is the check the hook's exit code cannot give us.
if grep -qE 'FAILED|reported an error' <<<"$merge_output"; then
  report failure "migration or post-merge step failed for ${target_sha}"
  fail "post-merge reported a failure. Production may be mid-upgrade; do not
retry blindly. Inspect the output above and follow the recovery guidance in
deploy/PRODUCTION.md."
fi

if git diff-tree -r --name-only --no-commit-id "$current_sha" "$target_sha" |
  grep -q '^packages/twenty-front/'; then
  log "frontend changed; republishing"
  bash "$DEPLOY_ROOT/deploy/publish-frontend.sh" || {
    report failure "frontend publish failed for ${target_sha}"
    fail "publish-frontend.sh failed"
  }
fi

healthy=true
for url in "$BACKEND_HEALTH" "$FRONTEND_HEALTH"; do
  if ! curl --fail --silent --show-error --max-time 10 "$url" >/dev/null 2>&1; then
    log "health check failed: $url"
    healthy=false
  fi
done

if [ "$healthy" != true ]; then
  report failure "deployed ${target_sha} but health checks failed"
  fail "production is unhealthy after deploying ${target_sha}. It is already
running the new commit, so this needs a person: see the rollback section of
deploy/PRODUCTION.md."
fi

echo "$target_sha" >"$STATE_FILE"
log "production is now running ${target_sha} and healthy"
report success "production is running ${target_sha}"
