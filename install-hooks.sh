#!/usr/bin/env bash
# install-hooks.sh — point this clone's git hooks at the ones tracked in the repo.
#
# TEMPLATE. Canonical copy: claude-code-policy/policy/gate-template/install-hooks.sh.
# Copy into a repo unchanged; it needs no per-repo edits.
#
# Idempotent. Run once per clone:
#
#   ./install-hooks.sh
#
# You should rarely need to. The policy package arms every known org clone at session start
# (bin/policies/gate-armed.py), because core.hooksPath is PER CLONE and a gate that only exists
# where somebody remembered to run an installer is not a gate. This script stays for the case that
# convergence cannot reach: a fresh clone on a machine or a path the policy package does not know.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "install-hooks: not a git repository — nothing to wire." >&2
  exit 1
fi

chmod +x .githooks/* verify.sh 2>/dev/null || true
[ -f ./sync-upstream.sh ] && chmod +x ./sync-upstream.sh 2>/dev/null || true
[ -f ./check-no-workflows.sh ] && chmod +x ./check-no-workflows.sh 2>/dev/null || true

current="$(git config --get core.hooksPath || true)"
if [ "$current" = ".githooks" ]; then
  echo "install-hooks: core.hooksPath already .githooks — nothing to do."
else
  git config core.hooksPath .githooks
  echo "install-hooks: core.hooksPath -> .githooks"
fi

# PROVE IT TOOK, rather than trusting the write. A hook that is configured but not executable is
# silently skipped by git — the same "looked fine, checked nothing" failure this repo is fixing.
[ "$(git config --get core.hooksPath)" = ".githooks" ] || {
  echo "install-hooks: core.hooksPath did not take — refusing to report success." >&2
  exit 1
}
[ -x .githooks/pre-push ] || {
  echo "install-hooks: .githooks/pre-push is not executable — git would skip it silently." >&2
  exit 1
}

# KEEP THE PUSH CONNECTION ALIVE WHILE THE GATE RUNS.
#
# git opens the connection to the remote and asks for its refs BEFORE it runs pre-push. When the
# gate then takes minutes, GitHub closes the idle session long before it finishes, and the pack is
# written to a socket nobody is holding: `git push` dies rc 141 (SIGPIPE) AFTER the hook has
# already printed "gates passed — pushing".
#
# That is the worst shape a failure can take — the gate said yes, the push said it was pushing, and
# nothing reached the remote. Measured in pangolin-tunnel on 2026-08-11, and found only because a
# branch that reported a clean push was absent from `git ls-remote`.
#
# Set REPO-LOCAL so it travels with the clone: no edit to anyone's ~/.ssh/config, nothing to
# remember on a new machine, nothing outside this repo affected.
git config core.sshCommand "ssh -o ServerAliveInterval=20 -o ServerAliveCountMax=30"
[ -n "$(git config --get core.sshCommand)" ] || {
  echo "install-hooks: core.sshCommand did not take — a slow gate will kill the push." >&2
  exit 1
}

echo "install-hooks: pre-push gate is armed (./verify.sh runs on every push)."
echo "install-hooks: push keepalive set (the gate outlives GitHub's SSH idle timeout)."
