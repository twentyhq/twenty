# Troubleshooting & Pitfalls

Common issues encountered when managing a fork with StGit, based on
real-world experience.

## Pitfall: `gh pr create` Targets Upstream

**Symptom**: PR is created on the upstream repository instead of the fork.

**Cause**: `gh` infers the target repository from the `upstream` remote,
not `origin`. When both remotes exist, it often picks wrong.

**Fix**: Always specify `--repo` explicitly:

```bash
# Wrong - may target upstream
gh pr create --title "Sync"

# Correct - explicitly targets the fork
gh pr create --repo <fork-owner>/<repo> --title "Sync"
```

**Recovery**: Close the accidental upstream PR:
```bash
gh pr close <number> --repo <upstream-owner>/<repo> \
  --comment "Accidentally created against upstream."
```

## Pitfall: Inverted Conflict Sides in StGit

**Symptom**: Resolving conflicts by keeping "ours" discards your patch
changes instead of keeping them.

**Cause**: During `stg push`, the conflict labels are inverted from
normal `git merge`:

| Label | In `stg push` | In `git merge` |
|-------|---------------|----------------|
| `current` / `--ours` | Base (upstream) | Your branch |
| `patched` / `--theirs` | Your patch | Incoming |

**Fix**: Always check the actual content of each side before resolving:

```bash
# To keep the upstream (base) version of a file:
git checkout --ours <file>

# To keep your patch version of a file:
git checkout --theirs <file>
```

**Rule of thumb**: In StGit conflicts, `--ours` = upstream, `--theirs` = patch.

## Pitfall: Merge Into Main Re-Conflicts

**Symptom**: After cleanly rebasing all patches on `stgit-branch`,
`git merge stgit-branch` on `main` produces new conflicts.

**Cause**: `main` diverged from the old upstream base at a different
commit than where stgit-branch was originally based. Git's three-way
merge sees different ancestors.

**Fix**: Since stgit-branch already has the correctly resolved state,
take its version for all conflicts:

```bash
git diff --name-only --diff-filter=U | xargs git checkout <stgit-branch> --
git add -A
git commit
```

## Pitfall: Branch Protection Blocks Push

**Symptom**: `git push origin main` fails with "push declined due to
repository rule violations".

**Cause**: Branch protection requires changes via pull request.

**Fix**: Create a sync branch and PR instead of pushing directly:

```bash
git checkout -b sync/upstream-vX.Y.Z-merge
git push -u origin sync/upstream-vX.Y.Z-merge
gh pr create --repo <fork-owner>/<repo> --base main \
  --head sync/upstream-vX.Y.Z-merge
```

## Pitfall: `stg push` Fails on New Files (AA Conflict)

**Symptom**: Conflict reported as `AA <file>` (both added) even though
only the patch adds the file.

**Cause**: Upstream added a file at the same path as the patch. Both
sides created the file independently.

**Fix**: Determine which version to keep:

- If upstream's version supersedes the patch (upstream absorbed the feature):
  ```bash
  git checkout --ours <file>       # Keep upstream's version
  ```
- If the patch version is still needed:
  ```bash
  git checkout --theirs <file>     # Keep patch version
  ```
- If both have valuable changes, manually merge the content.

After resolution:
```bash
git add <file>
stg refresh
stg push -a
```

## Pitfall: Empty Patches After Rebase

**Symptom**: `stg series` shows patches but `stg show <patch>` produces
no diff. Or `stg series --empty` marks patches with `*`.

**Cause**: Upstream merged equivalent changes. The patch content is now
part of the base, making the patch a no-op.

**Fix**:
```bash
stg series --empty    # Identify empty patches
stg clean             # Remove all empty patches
```

Update patch stack documentation after cleanup.

## Pitfall: StGit Not Initialized

**Symptom**: `stg series` returns "error: branch not initialized".

**Fix**:
```bash
stg init              # Initialize StGit on current branch
```

## Recovery: Undo Last StGit Operation

```bash
stg undo                  # Undo last operation
stg undo --hard           # Undo and discard working tree changes
stg undo -n 3             # Undo last 3 operations
```

## Recovery: Start Fresh

If the patch stack is hopelessly broken:

```bash
# Option A: Reset to upstream and re-import patches
stg pop -a
stg rebase upstream/main
# Selectively push patches, skipping broken ones:
stg push <good-patch-1>
stg push <good-patch-2>
# Delete broken patches:
stg delete <broken-patch>

# Option B: Nuclear option - export, reset, reimport
stg export -d /tmp/patches    # Save patches as files
git checkout main
git branch -D <stgit-branch>
git checkout -b <stgit-branch> upstream/main
stg init
# Manually re-apply relevant patches from /tmp/patches
```

## Diagnostic Commands

```bash
stg series -d                  # Full patch stack with descriptions
stg series --empty             # Identify empty patches
stg log                        # Operation history
git log --oneline -10          # Recent commits
git log --oneline <stgit-branch>..upstream/main --left-right  # Divergence
git diff --stat upstream/main  # Summary of all differences
```
