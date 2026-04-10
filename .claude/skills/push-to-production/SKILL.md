---
name: push-to-production
description: >
  Promote UAT to production: merge uat → prod, push to Railway, run metadata
  migrations, and migrate workflows. Use this skill whenever the user asks to
  push to production, promote UAT, release to production, or deploy to prod.
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# push-to-production

Promote the `uat` branch to production, carry over all custom metadata (objects,
fields, relations), and migrate workflows.

## What this covers

| Layer | How it's promoted |
|---|---|
| **Code** | Merge `uat` → `prod`; Railway auto-deploys `prod` to production |
| **TypeORM migrations** | Always run `yarn database:migrate:prod` after every deploy |
| **Twenty upgrade commands** | Run if version bumped (one minor version at a time) |
| **Custom objects / fields / relations** | Diff UAT vs prod → write migration scripts → dry-run → apply |
| **Workflows** | Export from UAT workspace Postgres, recreate in prod (see Step 8) |

## Repo layout

- Source: `/home/clive/_Projects/stratum/twenty/source/`
- `uat` branch → Railway UAT auto-deploy
- `prod` branch → Railway production auto-deploy (`main` is an archive branch — not watched by Railway)
- Railway UAT URL: `https://twenty-uat-0a4c.up.railway.app`
- Railway production URL: `https://twenty-production-eea0.up.railway.app`

---

## Checklist

Work through each step in order. **Do not skip steps.**

---

### 0. Pre-flight audit (before any code changes)

This step produces a complete picture of what the deployment will do. Complete
it and review the results with the user before touching any git or Railway state.

#### 0a. Collect API keys

Ask the user for both:

> "Please provide your **UAT** Twenty API key and your **production** Twenty API key
> (Settings → API & Webhooks → API Keys in each environment)."

#### 0b. Metadata diff — find all gaps between UAT and production

```bash
cd /home/clive/_Projects/stratum
SOURCE_KEY=<uat-api-key> TARGET_KEY=<prod-api-key> \
  python3 scripts/diff-environments.py
```

Review the output carefully:
- Custom objects in UAT but missing in production
- Custom fields (on any object) in UAT but missing in production

If the diff reveals gaps, **write and test the Python migration scripts now**
(see Step 7 below) — before the code is deployed. Do not proceed to Step 1
until migration scripts exist for all gaps.

#### 0c. Migration status — check what Python migrations are applied in production

```bash
cd /home/clive/_Projects/stratum
TWENTY_API_KEY=<prod-api-key> \
  TWENTY_API_URL=https://twenty-production-eea0.up.railway.app/graphql \
  python3 scripts/run-migrations.py --status
```

Any `✗ NOT APPLIED` or `~ PARTIAL` entries must be accounted for before continuing.

#### 0d. Check version delta

```bash
railway ssh --service twenty --environment uat -- "echo UAT: \$APP_VERSION"
railway ssh --service twenty --environment production -- "echo PROD: \$APP_VERSION"
```

Note whether a version bump is needed. If yes, upgrade commands will be required
in Step 5.

#### 0e. Check for pending TypeORM migrations

```bash
git -C /home/clive/_Projects/stratum/twenty/source log --oneline origin/prod..uat \
  -- "packages/twenty-server/src/database/typeorm/core/migrations/"
```

If any migration files appear, they will be applied in Step 4.

#### 0f. Write the deployment plan

Before proceeding, summarise for the user what will happen:

```
DEPLOYMENT PLAN
───────────────
Code:               uat → prod merge
TypeORM migrations: [yes/no — list file names if yes]
Upgrade commands:   [yes/no — from vX.Y.Z → vA.B.C]
Metadata gaps:      [list any custom objects/fields to create]
Python migrations:  [list which scripts will run]
Workflows to check: [list any new workflows in UAT]
```

Get explicit confirmation before continuing.

---

### 1. Confirm starting state

```bash
git -C /home/clive/_Projects/stratum/twenty/source branch --show-current
git -C /home/clive/_Projects/stratum/twenty/source status
```

- Must be on `uat`.
- If there are uncommitted changes, ask the user whether to commit or stash first.
- Do not proceed with a dirty working tree.

---

### 2. Set APP_VERSION before pushing (if version changed)

`APP_VERSION` is baked into the Docker image as a build ARG — it must be set
**before** the build starts.

If a version bump is needed:

```bash
railway variable set APP_VERSION=vX.Y.Z --service twenty --environment production
railway variable set APP_VERSION=vX.Y.Z --service twenty-worker --environment production
```

Omit `--skip-deploys` — the variable-only restart is fast and ensures the value
is captured when the code build starts immediately after.

---

### 3. Merge `uat` → `prod` and push

```bash
git -C /home/clive/_Projects/stratum/twenty/source checkout prod
git -C /home/clive/_Projects/stratum/twenty/source merge --no-ff uat -m "chore: promote uat → prod"
git -C /home/clive/_Projects/stratum/twenty/source push origin prod
git -C /home/clive/_Projects/stratum/twenty/source checkout uat
```

Railway will detect the push to `prod` and start a production build automatically.
Return to `uat` so the working directory stays on the dev branch.

> **Note:** `main` is an archive branch — do not push to it for deploys. Railway
> production watches `prod`. The `prod` branch was created because Railway's snapshot
> service chokes on large merge commits; keeping `prod` as a fast-forward-only branch
> ensures each push is a small incremental diff.

---

### 4. Wait for the production build

Monitor Railway logs:

```bash
railway logs --service twenty --environment production --lines 30
```

The server is ready when logs contain:
`Successfully registered all background sync jobs!`

**Do not run any SSH commands until this message appears.**

Once ready, verify `APP_VERSION` is correct:

```bash
railway ssh --service twenty --environment production -- "echo APP_VERSION=\$APP_VERSION"
```

If it still shows the old version, set the variable again (without `--skip-deploys`)
and wait for another restart before proceeding.

Check both `twenty` and `twenty-worker` services if the deploy touches worker code.

---

### 5. Run TypeORM migrations (always — every deployment)

Run this unconditionally after every deploy. It is idempotent — if there is
nothing to apply, it prints "No migrations to run" and exits cleanly.

```bash
railway ssh --service twenty --environment production -- \
  "cd /app && yarn database:migrate:prod"
```

Check output for errors before continuing. **Do not skip this step.**

---

### 6. Run upgrade commands (if a version bump was included)

Run the upgrade command **one minor version at a time** — it cannot skip minor versions.
For example, upgrading from v1.18 → v1.20 requires two passes:

```bash
railway ssh --service twenty --environment production -- \
  "cd /app/packages/twenty-server && node dist/command/command.js upgrade"
```

If that errors with "must be on at least previous minor version", run each
intermediate version explicitly:

```bash
railway ssh --service twenty --environment production -- \
  "cd /app/packages/twenty-server && APP_VERSION=v1.19.0 node dist/command/command.js upgrade"

railway ssh --service twenty --environment production -- \
  "cd /app/packages/twenty-server && APP_VERSION=v1.20.0 node dist/command/command.js upgrade"
```

`BackfillPageLayoutsCommand` may report "View already exists" errors — these are non-fatal.

---

### 7. Invalidate cache (always — every deployment)

Run this unconditionally after every deploy, whether or not upgrade commands ran.

```bash
railway ssh --service twenty --environment production -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flat-cache-invalidate --all-metadata"
```

---

### 8. Metadata migrations (objects, fields, relations)

Scripts live in `scripts/migrations/NNN-description.py` and are run by
`scripts/run-migrations.py`. All scripts are idempotent.

If migration scripts were written/updated in Step 0, they are ready to apply.

#### 8a — Dry-run against UAT first

Verify script logic against UAT (where all objects already exist):

```bash
cd /home/clive/_Projects/stratum
TWENTY_API_KEY=<uat-api-key> \
  TWENTY_API_URL=https://twenty-uat-0a4c.up.railway.app/graphql \
  python3 scripts/run-migrations.py --dry-run
```

All steps for existing objects/fields should show `[skip]`. Any `[error]`
lines indicate a missing dependency — fix the script before continuing.

#### 8b — Dry-run against production

```bash
TWENTY_API_KEY=<prod-api-key> \
  TWENTY_API_URL=https://twenty-production-eea0.up.railway.app/graphql \
  python3 scripts/run-migrations.py --dry-run
```

Review what will be created. Dependency `[error]` lines for new objects are
expected in dry-run mode — they will not appear in the live run.

#### 8c — Apply to production

```bash
TWENTY_API_KEY=<prod-api-key> \
  TWENTY_API_URL=https://twenty-production-eea0.up.railway.app/graphql \
  python3 scripts/run-migrations.py
```

---

### 9. Layout migrations (if any detail-view layout changes were made on UAT)

Record detail page layouts (`pageLayout → viewFieldGroup → viewField`) are **not**
covered by the metadata migration scripts or by `backfill-page-layouts`. Any
customisations made on UAT via the `manage-record-layout` skill must be replayed
on production using the idempotent SQL scripts in:

```
/home/clive/_Projects/stratum/scripts/layout-migrations/
  NNN-<object>-layout.sql
```

For each script:

1. **Test on UAT first** — should produce only `NOTICE` lines, no inserts/deletes:
   ```bash
   B64=$(base64 -w0 /home/clive/_Projects/stratum/scripts/layout-migrations/NNN-xxx.sql)
   railway ssh --environment uat --service twenty -- \
     "printf '%s' '$B64' | base64 -d > /tmp/m.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/m.sql"
   ```

2. **Apply to production:**
   ```bash
   railway ssh --environment production --service twenty -- \
     "printf '%s' '$B64' | base64 -d > /tmp/m.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/m.sql"
   ```

3. **Flush cache after all layout scripts have run:**
   ```bash
   railway ssh --environment production --service twenty -- \
     "cd /app/packages/twenty-server && node dist/command/command.js cache:flush"
   ```

If no layout changes were made since the last production deploy, skip this step.
See the `manage-record-layout` skill for the full SQL migration pattern.

---

### 10. Post-deployment verification (mandatory)

This step is not optional. The deployment is not complete until the diff is clean.

#### 10a — Re-run the metadata diff

```bash
cd /home/clive/_Projects/stratum
SOURCE_KEY=<uat-api-key> TARGET_KEY=<prod-api-key> \
  python3 scripts/diff-environments.py
```

**Expected result: zero gaps.** If gaps remain, return to Step 8 and resolve them.

#### 10b — Re-run migration status

```bash
TWENTY_API_KEY=<prod-api-key> \
  TWENTY_API_URL=https://twenty-production-eea0.up.railway.app/graphql \
  python3 scripts/run-migrations.py --status
```

All migrations should show `✓ APPLIED`.

#### 10c — Check logs for errors

```bash
railway logs --service twenty --environment production --lines 20 \
  | grep -E "(error|Error|FATAL)" | grep -v "Uncompiled message"
```

No output = healthy.

#### 10d — Spot-check the UI

- Hard-refresh the production browser tab
- Confirm custom objects appear in the sidebar
- Test at least one workflow trigger if any were migrated

---

### 11. Migrate workflows (if new workflows exist in UAT)

Workflows are stored as data in the workspace Postgres schema — they are NOT
covered by the metadata migration scripts.

#### Step 11a — List workflows in UAT

```bash
DB_URL=$(cd /home/clive/_Projects/stratum/twenty && \
  railway variables --service Postgres --environment uat --json 2>/dev/null | \
  python3 -c "import sys,json; d=json.load(sys.stdin); \
  print(d.get('DATABASE_PUBLIC_URL', d.get('DATABASE_URL','')))")

# Find the workspace schema name (UUID-named schema)
psql "$DB_URL" -c "\dn" | grep -v core | grep -v public

# List all workflows in the UAT workspace
psql "$DB_URL" -c "
  SELECT w.id, w.name, w.status,
         wv.trigger, wv.steps
  FROM <workspace_schema>.\"workflow\" w
  JOIN <workspace_schema>.\"workflowVersion\" wv ON wv.\"workflowId\" = w.id
  WHERE w.\"deletedAt\" IS NULL
  ORDER BY w.name;
"
```

Replace `<workspace_schema>` with the UUID schema name found above.

#### Step 11b — Recreate in production

Currently the safest approach is to **recreate each workflow in the production
UI** (Settings → Workflows). This avoids cross-environment UUID mismatches for
object references and field IDs.

For each workflow in UAT:
1. Note its name, trigger type, and steps
2. Open production Twenty UI → Settings → Workflows → New Workflow
3. Recreate the trigger and step sequence

> **Future enhancement**: A workflow export/import script using the Twenty
> GraphQL API could automate this. The relevant mutations are `createOneWorkflow`
> and `createOneWorkflowVersion`. Field/object IDs must be re-resolved against
> the production metadata API before creating.

---

## Notes

- **Never force-push `prod` or `main`.**
- **Never merge `uat` → `prod` without explicit user instruction.** Always confirm before this step.
- **`railway ssh`** is required to run commands inside Railway containers. `railway run` executes locally and will fail with "Cannot find module" errors.
- **APP_VERSION** on both production services must match the highest upgrade version in the codebase. Update via:
  `railway variable set APP_VERSION=vX.Y.Z --service twenty --environment production --skip-deploys`
  (and same for `twenty-worker`).
- Return to `uat` branch after the merge so the working directory stays on the development branch.
- When writing new Python migration scripts, follow the idempotent pattern from `001-account-group.py`. See the `migrate-metadata` skill for the full template.
- **`prod` branch only** — Railway production watches `prod`, not `main`. `main` is an archive branch kept for reference. Railway's snapshot service chokes on large merge commits; `prod` stays clean by receiving only incremental merges from `uat`.
