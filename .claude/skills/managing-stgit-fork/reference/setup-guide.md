# StGit Fork Setup Guide

Setting up StGit to manage a fork with a clean patch stack on top of upstream.

## Prerequisites

- Git repository with a fork relationship (origin = fork, upstream = source)
- StGit installed (`brew install stgit`, `pip install stgit`, or system package)
- Verify installation: `stg --version`

## Step 1: Configure Remotes

```bash
# origin should point to the fork
git remote -v
# origin  git@github.com:<fork-owner>/<repo>.git

# Add upstream if not present
git remote add upstream https://github.com/<upstream-owner>/<repo>.git
git fetch upstream
```

## Step 2: Create the StGit-Managed Branch

The StGit branch holds patches on top of upstream. Keep `main` as the
production branch, updated via merge after each sync.

```bash
# Create stgit branch from current main
git checkout main
git checkout -b stgit-migration

# Initialize StGit on this branch
stg init
```

## Step 3: Import Existing Commits as Patches

If the fork already has local commits on top of upstream, convert them
to StGit patches:

```bash
# Option A: Uncommit recent commits into patches
# (converts the last N commits into StGit patches)
stg uncommit -n <number-of-commits>

# Option B: Import from a range
stg uncommit <oldest-commit>..<newest-commit>
```

Each commit becomes a named patch. Rename for clarity:

```bash
stg rename <old-name> <new-descriptive-name>
```

## Step 4: Create Patches from Scratch

For new features not yet committed:

```bash
# Create a new empty patch
stg new my-feature-name -m "feat: Description of the feature"

# Make changes to files
# ...

# Record changes into the patch
stg refresh
```

## Step 5: Verify the Stack

```bash
stg series -d         # List all patches with descriptions
stg show              # Show the current (top) patch diff
stg log               # Show patch application history
```

## Branch Structure Convention

```
main              - Production branch, updated via merge + PR
stgit-migration   - StGit-managed branch, patches on upstream/main
upstream/main     - Upstream source repository
```

## Naming Conventions for Patches

Use numbered prefixes for ordering clarity:

```
01-feature-name          # First patch
02-related-change        # Second patch
03-another-feature       # Third patch
```

Benefits:
- `stg series` shows patches in application order
- Numbered names make reordering intentions clear
- Descriptive suffixes explain purpose at a glance

## Recording the Patch Stack

Document the current patch stack in the project's CLAUDE.md or README
for visibility:

```markdown
### Current Patch Stack
\```
01-my-feature        # Description of feature
02-setup-script      # Description of script
03-docs-updates      # Documentation changes
\```
```

Update this list whenever patches are added, removed, or absorbed upstream.

## Next Steps

After setup, the typical workflow is:
1. Develop on `stgit-migration` using `stg new` / `stg refresh`
2. Periodically sync with upstream (see `sync-workflow.md`)
3. Merge into `main` and push via PR
