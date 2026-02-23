# Upstream Sync Workflow

Complete procedure for rebasing the StGit patch stack onto the latest
upstream and updating the production branch.

## Overview

The sync has five stages:
1. **Fetch** - Get latest upstream commits
2. **Rebase** - Move patch stack onto new base
3. **Clean** - Remove patches absorbed by upstream
4. **Merge** - Integrate rebased branch into main
5. **PR** - Push via pull request (if branch protection is active)

## Stage 1: Fetch

```bash
git checkout <stgit-branch>
git fetch upstream
```

Check what changed:
```bash
# Count new upstream commits
git log --oneline <stgit-branch>..upstream/main | wc -l

# Preview upstream changes
git log --oneline upstream/main -20
```

## Stage 2: Rebase

### Option A: Staged Approach (Recommended for Large Updates)

Provides maximum control over conflict resolution:

```bash
stg pop -a                    # Pop all patches
stg rebase upstream/main      # Move stack base to upstream HEAD
stg push -a                   # Reapply patches one by one
```

### Option B: Single Command

Convenient for small, low-risk updates:

```bash
stg pull                      # Fetch + rebase in one step
```

### Handling Conflicts During `stg push`

When `stg push -a` stops on a conflict:

```
+ 01-my-feature (conflict)
error: merge conflicts; resolve manually then refresh or undo
UU path/to/conflicting/file.py
```

**Resolution loop:**

1. Identify conflicting files:
   ```bash
   git diff --name-only --diff-filter=U
   ```

2. Open each file and resolve `<<<<<<<` markers. Remember:
   - `<<<<<<< current` = upstream (the base)
   - `>>>>>>> patched` = your patch
   - This is **inverted** from normal `git merge`

3. For files where upstream's version should win entirely:
   ```bash
   git checkout --ours <file>    # Takes upstream (base) version
   ```

4. For files where the patch version should win:
   ```bash
   git checkout --theirs <file>  # Takes your patch version
   ```

5. Stage and refresh:
   ```bash
   git add <resolved-files>
   stg refresh
   ```

6. Continue pushing remaining patches:
   ```bash
   stg push -a
   ```

7. Repeat if the next patch also conflicts.

### Aborting a Failed Rebase

If conflicts are unresolvable or the rebase went wrong:

```bash
stg undo --hard               # Undo the last stg operation
```

For a complete reset:
```bash
stg pop -a
stg rebase --abort            # If rebase is in progress
```

## Stage 3: Clean Up Absorbed Patches

After rebase, check for patches that upstream merged:

```bash
stg series --empty            # Empty patches marked with '*'
```

If empty patches exist:
```bash
stg clean                     # Remove all empty patches
```

For explicit merged-patch detection during rebase:
```bash
stg rebase --merged upstream/main
```

**Update documentation** (CLAUDE.md, README) to reflect the new patch stack.

## Stage 4: Merge into Main

```bash
git checkout main
git merge <stgit-branch> -m "Merge <stgit-branch>: sync with upstream vX.Y.Z"
```

### Re-Conflicts During Merge

The merge from stgit-branch into main can produce conflicts even though
the patch stack is clean. This happens because main diverged at a
different point than the stgit base.

**Resolution**: Take stgit-branch's version for all conflicting files,
since it already has the correctly resolved state:

```bash
git checkout <stgit-branch> -- <file1> <file2> <file3>
git add <file1> <file2> <file3>
git commit
```

To resolve all conflicts at once:
```bash
git diff --name-only --diff-filter=U | xargs git checkout <stgit-branch> --
git add -A
git commit
```

## Stage 5: Push via PR

If branch protection blocks direct pushes to main:

```bash
git checkout -b sync/upstream-vX.Y.Z-merge
git push -u origin sync/upstream-vX.Y.Z-merge
```

Create the PR, **always specifying `--repo`** to target the fork:

```bash
gh pr create --repo <fork-owner>/<repo> \
  --base main \
  --head sync/upstream-vX.Y.Z-merge \
  --title "Sync with upstream vX.Y.Z" \
  --body "$(cat <<'EOF'
## Summary
- Rebased StGit patch stack onto upstream vX.Y.Z
- [N] upstream commits integrated
- [List any absorbed/removed patches]
- [List conflict resolutions if notable]

## Patch Stack ([N] patches)
- `01-patch-name` - Description
- `02-patch-name` - Description

## Test plan
- [ ] Verify core functionality works
- [ ] Run test suite
EOF
)"
```

After the PR is merged, reset the local main:
```bash
git checkout main
git pull origin main
```

## Post-Sync Checklist

- [ ] All patches applied cleanly (`stg series` shows no issues)
- [ ] Empty patches cleaned (`stg clean`)
- [ ] Patch stack documentation updated
- [ ] Main branch merged and PR created
- [ ] No accidental PR created on upstream repository
