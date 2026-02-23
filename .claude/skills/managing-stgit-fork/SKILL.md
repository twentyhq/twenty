---
name: managing-stgit-fork
description: |
  Manage a Git fork using StGit (Stacked Git) for maintaining local patches
  on top of upstream. Covers syncing with upstream, patch stack management,
  conflict resolution, and PR-based branch protection workflows.
  Triggers: "sync", "update", "upstream", "stgit", "stg pull",
  "rebase patches", "update fork", "patch stack", "stg push",
  "pull in latest", "fork is behind", "catch up with upstream",
  "merge upstream", "absorbed patch".
allowed-tools: Read, Bash, Glob, Grep, Edit
version: "1.0.0"
tags:
  - git
  - stgit
  - fork
  - patches
  - upstream
  - rebase
  - sync
  - update
---

# StGit Fork Manager

> Maintains a clean patch stack on top of upstream using StGit, enabling
> conflict-free syncing and structured fork management.

## 1. Context Injection (MANDATORY)

**Before** performing any StGit operation, load the relevant reference:

- **IF setting up StGit on a new fork:**
  `Read("reference/setup-guide.md")`

- **IF syncing with upstream (rebase, pull, merge to main):**
  `Read("reference/sync-workflow.md")`

- **IF creating, modifying, or reorganizing patches:**
  `Read("reference/patch-management.md")`

- **IF encountering conflicts, errors, or unexpected behavior:**
  `Read("reference/troubleshooting.md")`

## 2. Pre-Flight Check

Before any StGit operation, verify the environment:

```bash
git branch --show-current       # Must be stgit-managed branch
stg series -d                   # Show current patch stack
git remote -v                   # Verify upstream remote exists
```

- **If not on the StGit branch**: Switch first with `git checkout <stgit-branch>`
- **If no `upstream` remote**: Set up the fork first (see setup guide)
- **If `stg` not found**: Install with `brew install stgit` or `pip install stgit`

## 3. Core Sync Workflow (Quick Reference)

```bash
# 1. Prepare
git checkout <stgit-branch>
git fetch upstream

# 2. Rebase
stg pop -a
stg rebase upstream/main
stg push -a                     # Resolve conflicts per-patch if needed

# 3. Clean up absorbed patches
stg series --empty
stg clean

# 4. Merge into main
git checkout main
git merge <stgit-branch> -m "Merge <stgit-branch>: sync with upstream vX.Y.Z"

# 5. Push via PR (if branch protection is active)
git checkout -b sync/upstream-vX.Y.Z-merge
git push -u origin sync/upstream-vX.Y.Z-merge
gh pr create --repo <owner>/<repo> --base main --head sync/upstream-vX.Y.Z-merge
```

**Per-patch conflict resolution loop:**
```bash
# After stg push reports a conflict:
# 1. Edit conflicting files (resolve <<<<<<< markers)
# 2. git add <resolved-files>
# 3. stg refresh
# 4. stg push -a                # Continue with remaining patches
```

## 4. Critical Rules

**ALWAYS:**
- Use `--repo <owner>/<repo>` with `gh pr create` to target the correct fork
- Run `stg series --empty` + `stg clean` after rebase to remove absorbed patches
- Update patch stack documentation after patches are added, removed, or absorbed
- Verify merge result by checking out stgit-branch's file versions on conflict

**NEVER:**
- Push directly to main if branch protection is enabled
- Run `gh pr create` without `--repo` (defaults to upstream, not the fork)
- Edit applied patches without using `stg goto` + `stg refresh`
- Assume `--ours`/`--theirs` in StGit matches normal git merge semantics

## 5. Conflict Semantics Warning

During `stg push`, conflict sides are **inverted** from normal `git merge`:

| Label | StGit `stg push` | Normal `git merge` |
|-------|-------------------|--------------------|
| `current` / `--ours` | Base (upstream) | Your branch |
| `patched` / `--theirs` | Your patch | Incoming branch |

Always verify which side is which before resolving.

## 6. Navigation

| Topic | Reference |
|-------|-----------|
| Initial fork setup | `reference/setup-guide.md` |
| Full sync procedure | `reference/sync-workflow.md` |
| Patch operations | `reference/patch-management.md` |
| Pitfalls & recovery | `reference/troubleshooting.md` |
