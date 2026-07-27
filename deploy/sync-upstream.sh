#!/bin/bash
# =============================================================================
# Weekly upstream sync: open a PR bringing twentyhq/twenty main into the fork.
# =============================================================================
# NEVER merges automatically. Upstream main is a fast-moving dev branch and our
# main deploys to the live CRM, so a human reviews/merges the PR (CI Fork runs
# on it like any other PR). If the merge conflicts with our custom commits,
# this opens a GitHub issue listing the conflicting files instead.
#
# Runs weekly via cron from the deploy clone (see crontab -l). Run by hand:
#   bash deploy/sync-upstream.sh
# Merge work happens in a throwaway git worktree — the checkout this script
# lives in is never touched, so it's safe to run next to the live stack.
# =============================================================================
set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

REPO="SpeculativeTechnologies/CRM"
HTTPS_URL="https://github.com/$REPO.git"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Push over https with gh's token — cron has no ssh-agent/keychain.
push_branch() {
  git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
    push "$HTTPS_URL" "$1"
}

echo "[sync-upstream] $(date) fetching..."
git fetch --quiet origin main
git fetch --quiet upstream main

if git merge-base --is-ancestor upstream/main origin/main; then
  echo "[sync-upstream] fork already contains upstream/main — nothing to do"
  exit 0
fi

# One sync PR at a time; don't stack a new one on an unreviewed one.
OPEN_SYNC_PRS=$(gh pr list -R "$REPO" --state open --json headRefName \
  --jq '[.[] | select(.headRefName | startswith("sync/upstream"))] | length')
if [ "$OPEN_SYNC_PRS" -gt 0 ]; then
  echo "[sync-upstream] an open sync PR already exists — merge or close it first"
  exit 0
fi

BEHIND=$(git rev-list --count origin/main..upstream/main)
BRANCH="sync/upstream-$(date +%Y-%m-%d)"
WORKTREE="$(mktemp -d)/sync"
git worktree add --quiet --detach "$WORKTREE" origin/main
cleanup() {
  git worktree remove --force "$WORKTREE" 2>/dev/null
  git branch -D "$BRANCH" 2>/dev/null
}
trap cleanup EXIT

cd "$WORKTREE"
git switch --quiet -c "$BRANCH"

if git merge --no-edit upstream/main >/dev/null 2>&1; then
  # Flag schema-touching changes so the reviewer knows a DB migration rides along.
  SCHEMA_CHANGES=$(git diff --name-only origin/main..upstream/main -- \
    'packages/twenty-server/src/database' '**/*.entity.ts' | head -20)
  push_branch "$BRANCH"
  gh pr create -R "$REPO" --base main --head "$BRANCH" \
    --title "Sync upstream twentyhq/twenty ($BEHIND commits)" \
    --body "$(printf 'Automated weekly upstream sync (%s upstream commits, merged cleanly).\n\nAfter merging, deploy with the usual pull in ~/Deploy/twenty; the post-merge hook runs update-after-merge.sh (yarn install + DB migrate + cache invalidate) when needed.\n\n%s' \
      "$BEHIND" \
      "$( if [ -n "$SCHEMA_CHANGES" ]; then printf '**Schema/migration files changed upstream** — review with extra care:\n```\n%s\n```' "$SCHEMA_CHANGES"; else echo 'No schema/migration changes detected upstream.'; fi )")"
  echo "[sync-upstream] OK: PR opened for $BRANCH ($BEHIND commits)"
else
  CONFLICTS=$(git diff --name-only --diff-filter=U)
  git merge --abort 2>/dev/null
  OPEN_ISSUES=$(gh issue list -R "$REPO" --state open --search 'Upstream sync conflict in:title' --json number --jq length)
  if [ "$OPEN_ISSUES" -eq 0 ]; then
    gh issue create -R "$REPO" \
      --title "Upstream sync conflict ($(date +%Y-%m-%d))" \
      --body "$(printf 'Weekly upstream sync could not merge twentyhq/twenty main (%s commits behind) — manual merge needed:\n\n```\ngit fetch upstream && git switch -c sync/upstream-manual main && git merge upstream/main\n```\n\nConflicting files:\n```\n%s\n```' "$BEHIND" "$CONFLICTS")"
    echo "[sync-upstream] CONFLICT: issue opened (files: $(echo "$CONFLICTS" | wc -l | tr -d ' '))"
  else
    echo "[sync-upstream] CONFLICT: issue already open — skipping duplicate"
  fi
  exit 1
fi
