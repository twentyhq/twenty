---
name: sync-upstream
description: >
  Merge the latest upstream Twenty (twentyhq/twenty main) into the current
  branch, resolve any conflicts, and note any new upgrade commands that must
  be run against Railway after the next deploy. Use this skill whenever the
  user asks to sync with upstream, pull upstream changes, or update from Twenty.
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# sync-upstream

Merge upstream Twenty changes into the current branch.

## Repo layout

- Source: `/home/clive/_Projects/stratum/twenty/source/`
- Upstream remote: `upstream` → `https://github.com/twentyhq/twenty.git`
- Our fork: `origin` → `https://github.com/StratumCM/CRM.git`

## Steps

### 1. Fetch upstream and check for new commits

```bash
git -C /home/clive/_Projects/stratum/twenty/source fetch upstream
git -C /home/clive/_Projects/stratum/twenty/source log HEAD..upstream/main --oneline
```

If there are no new commits, nothing to do — report that we're already up to date.

### 2. Merge upstream/main

```bash
git -C /home/clive/_Projects/stratum/twenty/source merge upstream/main
```

### 3. Resolve conflicts (if any)

```bash
git -C /home/clive/_Projects/stratum/twenty/source diff --diff-filter=U --name-only
```

For each conflicted file:

- Read the full file to understand the conflict in context.
- Check what our HEAD version looked like: `git show HEAD:<path>`
- **Keep our custom code** — the files most likely to conflict are ones we've
  customised (record picker filtering, conditional fields, query hooks, etc.).
- **Adopt upstream's structural changes** — if upstream refactored logic we
  also touch (e.g. moved a hook, renamed a type), adopt their structure and
  graft our behaviour on top.
- After resolving all files, verify no conflict markers remain:

```bash
grep -r "<<<<<<\|=======\|>>>>>>" /home/clive/_Projects/stratum/twenty/source/packages \
  --include="*.ts" --include="*.tsx" -l
```

Any hit that isn't a false positive (characters inside a string literal) must
be resolved before continuing.

### 4. Check for new upgrade commands

Look at the diff for any new command files:

```bash
git -C /home/clive/_Projects/stratum/twenty/source diff HEAD~1..HEAD \
  --name-only -- 'packages/twenty-server/src/database/commands/**'
```

Also scan merged commit messages for hints:

```bash
git -C /home/clive/_Projects/stratum/twenty/source \
  log HEAD~$(git -C /home/clive/_Projects/stratum/twenty/source log HEAD..ORIG_HEAD --oneline | wc -l)..HEAD \
  --oneline | grep -iE "migration|upgrade|rename|enum|field type"
```

For each new upgrade command file found:
1. Read it to understand what it does (schema changes, enum renames, data fixes).
2. Note the command name (from the `@Command({ name: '...' })` decorator).
3. Check if the command touches `navigationMenuItem`, `fieldMetadata`, or other
   data that populates the flat entity cache — if so, a cache invalidation will
   be needed after running it.

**Report the command names clearly** so push-to-uat can include them in the
post-deploy checklist.

### 5. Check for APP_VERSION bump

If the merged commits include a version bump (look for "Publish new version"
in commit messages), check whether the new version introduces a new upgrade
command tier (e.g. 1-20 → 1-21):

```bash
git -C /home/clive/_Projects/stratum/twenty/source \
  log HEAD~$(git -C /home/clive/_Projects/stratum/twenty/source log HEAD..ORIG_HEAD --oneline | wc -l)..HEAD \
  --oneline | grep -i "publish\|version"
```

If a new upgrade tier appears, APP_VERSION on both UAT services must be updated:

```bash
railway variable set APP_VERSION=vX.Y.Z --service twenty --environment uat --skip-deploys
railway variable set APP_VERSION=vX.Y.Z --service twenty-worker --environment uat --skip-deploys
```

### 6. Commit the merge

### 7. Run upgrade migrations on UAT (after deploy)

After the deploy to UAT succeeds, run upgrade migrations via Railway SSH.

**Mechanism (post-1.23):** The `core.workspace.version` column was dropped in
1.23 (by `drop-workspace-version-column` fast instance command). State is now
tracked in `core.upgradeMigration` — one row per executed command, per workspace
or per instance. The `upgrade` command reads this table, builds the full sequence
across `TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS` (= previous versions + current),
and runs only what hasn't been recorded yet. No manual per-version stepping.

#### Normal flow

Run `upgrade` — it handles the whole cross-version sequence in one go:

```bash
railway ssh --environment uat --service twenty -- \
  "cd /app/packages/twenty-server && node dist/command/command.js upgrade"
```

Then flush the cache:

```bash
railway ssh --environment uat --service twenty -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flush"
```

**Dry-run first if the gap is large:**
```bash
railway ssh --environment uat --service twenty -- \
  "cd /app/packages/twenty-server && node dist/command/command.js upgrade --dry-run --verbose"
```

#### Inspecting and repairing state

Check what's already run:
```bash
railway ssh --environment uat --service twenty -- \
  'psql "$PG_DATABASE_URL" -c "SELECT \"executedByVersion\", name, status FROM core.\"upgradeMigration\" ORDER BY \"createdAt\" DESC LIMIT 20;"'
```

If a command failed, its row has `status='failed'`. Fix the cause, delete the
failed row(s), and re-run `upgrade` — it'll re-pick them up.

If you need to force a successful command to run again (e.g. after a data
correction), delete its row(s) from `upgradeMigration` and re-run `upgrade`.

#### Missing from the sequence

If `upgrade` errors with `Step "X" not found in upgrade sequence. The sequence
only covers versions [A, B, C]` — the workspace is too far behind the server's
cross-upgrade window. Options: step the server back to an intermediate version
first, or sync upstream in smaller hops.

#### Known idempotency issues (historical)

- **"flat entity to add already exists"** (e.g. `backfill-page-layouts`): data
  was partially created by an earlier attempt. Usually safe to mark complete
  and move on — the existing records are sufficient.
- The three 1-20 commands that previously failed with "constraint already exists"
  (`make-permission-flag-*-not-nullable`, `make-object-permission-*-not-nullable`,
  `backfill-navigation-menu-item-type`) have since been patched to be idempotent.

```bash
git -C /home/clive/_Projects/stratum/twenty/source add -A
git -C /home/clive/_Projects/stratum/twenty/source commit -m "Merge upstream Twenty vX.Y / <summary>"
```

## Conflict resolution guide

Our customised files and what to preserve in each:

| File | What we added | Upstream risk |
|---|---|---|
| `useSingleRecordPickerPerformSearch.ts` | `additionalFilter` param + `selectedIdsFilter` with `and` combinator | Upstream may refactor hook internals — keep our filter logic, adopt their structure |
| `FieldsWidgetFieldList.tsx` | `useOpportunityConditionalFields` call + `.filter()` on fields | Upstream may add/remove other passes over `fields` — always keep our filter |
| `desk/query-hooks/*` | New files — no upstream equivalent, no conflict expected | — |
| `opportunity/query-hooks/*` | New files — no upstream equivalent, no conflict expected | — |
| `workspace-query-hook.module.ts` | `DeskQueryHookModule` + `OpportunityQueryHookModule` in `imports[]` | Upstream may add other modules — keep all entries, add ours if missing |

## Notes

- **Why upgrade commands matter**: Twenty's upgrade commands handle data migrations
  (enum renames, field type changes, new nav items) not covered by TypeORM schema
  migrations. Missing them causes server crashes (wrong enum values) or missing
  UI data (stale cache). We were bitten by both: `RICH_TEXT_V2` crash (v1.20)
  and missing sidebar after `backfill-missing-standard-views` (v1.19).
- **Since 1.23, `upgrade` chains the full cross-version sequence in one run**,
  driven by `core.upgradeMigration` rather than a version column. Pre-1.23 it only
  ran the current version's commands and required manual version bumps in the DB —
  that legacy flow is gone. We were bitten by it on v1.18→1.20: `migrate-favorites-to-navigation-menu-items`
  (1-18) had never run so Workflows nav was missing, even though `core.workspace.version`
  said 1.18.1.
- **The Railway container entry point for commands is `dist/command/command.js`**,
  not `dist/main.js`. Using `main.js` fails with `EADDRINUSE` because it tries to
  start the HTTP server.
- **TypeORM migrations** may also need running after a merge if new migration files
  were added. Check with `yarn database:migrate:prod` via Railway SSH if the server
  fails to start with column-not-found errors.
