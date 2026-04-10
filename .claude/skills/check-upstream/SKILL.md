---
name: check-upstream
description: >
  Fetch the latest upstream Twenty (twentyhq/twenty main) and summarise what
  has changed since our last sync — new features, bug fixes, migrations needed,
  upgrade commands, and version bumps — without merging anything. Use this
  whenever the user wants to know what's new upstream before deciding whether
  to sync.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
---

# check-upstream

Summarise what's new in upstream Twenty since our last sync. **Read-only — do not merge, commit, or push anything.**

## Repo layout

- Source: `/home/clive/_Projects/stratum/twenty/source/`
- Upstream remote: `upstream` → `https://github.com/twentyhq/twenty.git`
- Our fork: `origin` → `https://github.com/StratumCM/CRM.git`

## Steps

### 1. Fetch and count

```bash
git -C /home/clive/_Projects/stratum/twenty/source fetch upstream
git -C /home/clive/_Projects/stratum/twenty/source log HEAD..upstream/main --oneline | wc -l
```

If 0 commits, report "Already up to date" and stop.

### 2. Get all commit messages

```bash
git -C /home/clive/_Projects/stratum/twenty/source log HEAD..upstream/main --oneline
```

Read all of them. Group by theme:
- **Features** — commits starting with `feat:`
- **Bug fixes** — commits starting with `fix:`
- **Migrations / schema** — anything mentioning migration, enum, field type, rename, upgrade
- **Version bumps** — "Publish new version" commits
- **Other** (chores, docs, refactors) — summarise briefly, don't list individually

### 3. Check for new TypeORM migration files

```bash
git -C /home/clive/_Projects/stratum/twenty/source diff HEAD..upstream/main \
  --name-only -- 'packages/twenty-server/src/database/typeorm/core/migrations/**' \
                 'packages/twenty-server/src/database/typeorm/metadata/migrations/**'
```

List any new migration files found. Note what each one does based on its filename.

### 4. Check for new upgrade command files

```bash
git -C /home/clive/_Projects/stratum/twenty/source diff HEAD..upstream/main \
  --name-only -- 'packages/twenty-server/src/database/commands/**'
```

For each new command file, read it to find:
- The `@Command({ name: '...' })` decorator — this is the command to run post-deploy
- What it does (enum rename, data backfill, nav item creation, etc.)
- Whether it touches `navigationMenuItem`, `fieldMetadata`, or cached entities
  (if so, a `cache:flat-cache-invalidate --all-metadata` will be needed after)

### 5. Check for version bump

```bash
git -C /home/clive/_Projects/stratum/twenty/source log HEAD..upstream/main \
  --oneline | grep -i "publish\|version"
```

If a version bump is present, note the new version number and whether it
introduces a new upgrade tier (e.g. 1-20 → 1-21).

### 6. Check for conflicts with our customised files

Run a dry-run merge to see which of our files would conflict:

```bash
git -C /home/clive/_Projects/stratum/twenty/source merge --no-commit --no-ff upstream/main 2>&1 | \
  grep -E "CONFLICT|Automatic merge failed"
git -C /home/clive/_Projects/stratum/twenty/source merge --abort 2>/dev/null || true
```

List any files that would conflict. Flag especially:
- `useSingleRecordPickerPerformSearch.ts` — we added `additionalFilter`
- `FieldsWidgetFieldList.tsx` — we added conditional field filtering
- `workspace-query-hook.module.ts` — we added custom module imports

### 7. Write the summary

Produce a concise report in this structure:

---

## Upstream check — vX.Y.Z (N commits)

**Version:** current → new (if bumped, otherwise "no version bump")

### Features
- bullet per notable feature

### Bug fixes
- bullet per notable fix (group minor ones: "several minor UI/UX fixes")

### ⚠️ Action required after syncing

**TypeORM migrations** (run automatically on deploy if included):
- list new migration files and what they do, or "none"

**Upgrade commands** (must be run manually via Railway SSH after deploy):
- `command:name` — what it does
- or "none"

**Cache invalidation needed:** yes/no — reason

**APP_VERSION bump needed:** yes/no — new value if yes

### Conflicts expected
- list files, or "none expected"

### Other changes
- brief summary of chores/refactors/docs

---

Keep the summary tight — the goal is a quick decision on whether to sync now or wait.
