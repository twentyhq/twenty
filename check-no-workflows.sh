#!/usr/bin/env bash
# check-no-workflows.sh — fail if this repo has grown a GitHub Actions workflow again.
#
# TEMPLATE. Canonical copy: claude-code-policy/policy/gate-template/check-no-workflows.sh.
# Copy into a repo and call it from verify.sh as one of the gates.
#
# WHY THIS IS A CHECK AND NOT A COMMENT
# -------------------------------------
# Every workflow in this org was deleted and replaced by ./verify.sh, because Actions cannot run
# here (billing) and a check that cannot run is not a check. Deleting them once is not the same as
# them staying deleted. Two things put them back:
#
#   1. An upstream merge. For a repo tracking an upstream codebase, `git merge upstream/<branch>`
#      re-adds any workflow upstream ADDED since the last sync. That arrives with NO conflict and
#      NO diff a human would notice among a thousand upstream files — the silent case, and the
#      dangerous one. (A file upstream MODIFIED that we deleted conflicts loudly; that one is fine.)
#   2. A tool or a person adding one by habit, because .github/workflows is where CI "goes".
#
# Either way the repo quietly acquires a job that reports failure for an account reason and tells
# everyone nothing. So the removal is enforced by the same gate as everything else: exit non-zero
# the day a workflow reappears, in the pre-push hook, before it reaches the trunk.
#
# Exit 0 = no workflows. Exit 1 = at least one, named.

set -uo pipefail
cd "$(dirname "$0")" || exit 1

DIR=".github/workflows"

if [ ! -d "$DIR" ]; then
  echo "no-workflows: ${DIR}/ does not exist — good."
  exit 0
fi

# A directory is not the violation; a workflow FILE in it is. GitHub only ever runs *.yml/*.yaml
# from this exact directory (not from subdirectories), so that is precisely what is checked —
# matching BEHAVIOUR rather than the presence of a path.
#
# No `mapfile`: that is bash 4+, and macOS ships bash 3.2 as /bin/bash. A gate that only runs on
# some machines is the silent skip this whole exercise exists to remove.
found="$(find "$DIR" -maxdepth 1 -type f \( -name '*.yml' -o -name '*.yaml' \) 2>/dev/null | sort)"

if [ -z "$found" ]; then
  echo "no-workflows: ${DIR}/ exists but holds no workflow file — good."
  exit 0
fi

{
  echo "no-workflows: GitHub Actions workflows are back in this repo:"
  echo "$found" | sed 's/^/    /'
  echo
  echo "  Actions cannot run for this org (billing), so each of these reports failure for an"
  echo "  account reason and checks nothing. This repo's gate is ./verify.sh."
  echo
  echo "  If an upstream merge brought them in, that is what ./sync-upstream.sh exists to handle:"
  echo "    git rm -r --ignore-unmatch ${DIR} && git commit"
  echo "  If someone added one on purpose, that is a decision to take with the operator first."
} >&2
exit 1
