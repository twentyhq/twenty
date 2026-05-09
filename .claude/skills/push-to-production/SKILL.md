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
| **User-visible state** | Maintenance handler 503-page on the prod `twenty` service for the destructive window (Step 0g on, Step 12 off; briefly off again for Step 8 / 10a) |
| **Recovery point** | Fresh `pg_dump` to S3 immediately before any non-read-only action (Step 0h) — recovery point if anything in Steps 4–8 corrupts prod |
| **Code** | Merge `uat` → `prod`; Railway auto-deploys `prod` to production |
| **Instance commands (TypeORM migrations + DDL)** | `run-instance-commands --force` after every deploy (Step 5) |
| **Twenty upgrade commands** | `upgrade` if version bumped (Step 6); cross-version sequence runs in one go |
| **Custom objects / fields / relations** | Diff UAT vs prod → write migration scripts → dry-run → apply (Step 8); MORPH_RELATION deletes go via direct SQL, not the API |
| **Workflows** | Export from UAT workspace Postgres, recreate in prod (Step 11) |

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

#### 0a. Source API keys from `.env`

Both keys are stored in `/home/clive/_Projects/stratum/.env` as
`TWENTY_UAT_API_KEY` / `TWENTY_PROD_API_KEY` (and matching `TWENTY_UAT_URL` /
`TWENTY_PROD_URL`). Source the file before running diff/migration scripts:

```bash
set -a; . /home/clive/_Projects/stratum/.env; set +a
```

If those env vars aren't set (fresh checkout or different machine), ask the
user to copy them from Settings → API & Webhooks → API Keys in each environment.

#### 0b. Metadata diff — find all gaps between UAT and production

```bash
cd /home/clive/_Projects/stratum/twenty/source/scripts/stratum
SOURCE_KEY="$TWENTY_UAT_API_KEY" TARGET_KEY="$TWENTY_PROD_API_KEY" \
  python3 diff-environments.py
```

Review the output carefully:
- Custom objects in UAT but missing in production
- Custom fields (on any object) in UAT but missing in production
- Same-name fields whose label / options / settings differ — pay attention to
  these too, the diff script flags them as "EXTRA in target" or similar

If the diff reveals gaps, **write and test the Python migration scripts now**
(see Step 7 below) — before the code is deployed. Do not proceed to Step 1
until migration scripts exist for all gaps.

> **Polarity reminder:** in `diff-environments.py` output, `EXTRA` means
> "in target (prod) but NOT in source (UAT)", and `MISSING` means "in source
> but NOT in target". Read the labels carefully — getting the direction wrong
> led to writing migrations that ran the wrong way on 2026-05-09.

#### 0c. Migration status — check what Python migrations are applied in production

```bash
TWENTY_API_KEY="$TWENTY_PROD_API_KEY" TWENTY_API_URL="$TWENTY_PROD_URL" \
  python3 run-migrations.py --status
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

#### 0g. Put production into maintenance mode

Before any non-read-only action on prod, ask the user to set a Custom Start
Command on the production `twenty` service that returns 503 to all HTTP traffic.
This protects users from seeing inconsistent metadata or partial-state errors
during the deploy + DDL window.

> **Ask the user:**
>
> "Please set a Custom Start Command on the **production** `twenty` service in
> Railway dashboard → Settings → Deploy:
>
> ```
> node -e "require('http').createServer((_,r)=>{r.writeHead(503,{'Content-Type':'text/html'});r.end('<h1>Maintenance in progress</h1><p>Stratum CRM will be back shortly.</p>');}).listen(process.env.PORT)"
> ```
>
> Save → Railway will redeploy the service with the maintenance handler. Tell
> me when users see the maintenance page."

Wait for explicit confirmation before continuing.

**What still works under maintenance:**
- `railway ssh --service twenty …` and any commands run inside the container
  (`node dist/command/command.js …`, `psql`, etc.) — the maintenance handler
  only replaces the HTTP server, not the container.

**What's blocked under maintenance:**
- HTTP API: `/graphql`, `/metadata`, `/rest/*` all return 503. Anything that
  goes via the public URL (the Python migration scripts, `diff-environments.py`,
  `curl https://twenty-production-…/graphql`) will fail with 503 until
  maintenance is off again.
- Step 8 (metadata migrations) and Step 10a (metadata diff) need the HTTP API
  and have an explicit "maintenance off" instruction.

#### 0h. Fresh pg_dump before any destructive action

The nightly `twenty-db-backup` service runs at 02:00 UTC. For a push happening
later in the day, force a fresh backup right now so the recovery point is
seconds before the deploy starts:

```bash
railway ssh --service twenty-db-backup --environment production -- \
  '/bin/bash /scripts/backup.sh'
```

Confirm the new file landed in S3:

```bash
railway ssh --service twenty-db-backup --environment production -- \
  'AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY \
   aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --endpoint-url $S3_ENDPOINT --region $S3_REGION \
   | tail -3'
```

Note the filename (e.g. `railway_2026-05-09T08:42:00Z.sql.gz`) — it's the
recovery point if anything in Steps 4–8 corrupts the prod DB. The surgical
restore pattern used on 2026-05-09 (download backup, extract specific tables
into a recovery schema, ALTER + UPDATE FROM, drop recovery schema) is documented
in this repo's git history under "fix(scripts): build_recovery.py …" — re-use
that approach if you need it.

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

### 5. Run instance commands (always — every deployment)

Run this unconditionally after every deploy. The package.json's
`database:migrate:prod` is literally `node dist/command/command run-instance-commands`,
and it covers two layers:

- New TypeORM migrations
- Twenty `@RegisteredInstanceCommand` files (DDL + data fixes), **including
  ones backported by upstream into past-version folders that the boot-time
  forward-only `upgrade` cursor silently skips**

The `--force` flag bypasses the workspace-version safety check (which has
its own cursor-based logic that can fail under the same backport scenario).
Idempotent — already-completed commands print "already executed, skipping".

```bash
railway ssh --service twenty --environment production -- \
  "cd /app/packages/twenty-server && node dist/command/command.js run-instance-commands --force"
```

Check output for errors before continuing. **Do not skip this step.**

Symptom of skipping it after an upstream catch-up merge:
`column <Entity>.<field> does not exist` runtime errors.

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

Scripts live in `scripts/stratum/migrations/NNN-description.py` (under
`twenty/source/`) and are run by `scripts/stratum/run-migrations.py`.
All scripts are idempotent.

If migration scripts were written/updated in Step 0, they are ready to apply.

> **⚠️ MORPH_RELATION DANGER — read before any migration that deletes a
> MORPH_RELATION variant field**
>
> Twenty's `delete_field` API on a MORPH_RELATION variant cascades and drops
> *every* `target*` column on the morph host object at the DB level. Hit
> this on 2026-05-09 with migration 019: deleting `attachment.targetAccounttag`
> wiped all 24 `target*` columns on `attachment`, plus the same on
> `noteTarget`/`taskTarget`/`timelineActivity` — 84 columns + 17,796 rows of
> foreign-key data dropped, requiring full surgical restore from backup.
>
> If a planned migration deletes a MORPH_RELATION variant, **don't** use the
> Python migration script. Instead, drop just the single column with direct
> SQL, then DELETE the single fieldMetadata row, then `cache:flat-cache-invalidate`.
> Test on UAT first.

> **Maintenance handler must be off for this step.** The Python scripts hit
> the prod `/metadata` HTTP endpoint, which the maintenance handler intercepts
> with a 503. Ask the user:
>
> "Please clear the Custom Start Command on the production `twenty` service
> in Railway dashboard → Settings → Deploy and save. Wait for the new build
> to come up (~10 min) and tell me when prod returns 200 to a basic GraphQL
> probe."
>
> ```bash
> set -a; . /home/clive/_Projects/stratum/.env; set +a
> curl -sS -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $TWENTY_PROD_API_KEY" \
>   -X POST https://twenty-production-eea0.up.railway.app/graphql \
>   -H "Content-Type: application/json" -d '{"query":"{ __typename }"}'
> ```
>
> If you anticipate further destructive work after this step, ask the user
> to put maintenance back on after Step 8 completes; otherwise leave it off
> through Step 11.

Working dir for the next three sub-steps: `/home/clive/_Projects/stratum/twenty/source/scripts/stratum/`.

#### 8a — Dry-run against UAT first

Verify script logic against UAT (where all objects already exist):

```bash
set -a; . /home/clive/_Projects/stratum/.env; set +a
cd /home/clive/_Projects/stratum/twenty/source/scripts/stratum
TWENTY_API_KEY="$TWENTY_UAT_API_KEY" TWENTY_API_URL="$TWENTY_UAT_URL" \
  python3 run-migrations.py --dry-run
```

All steps for existing objects/fields should show `[skip]`. Any `[error]`
lines indicate a missing dependency — fix the script before continuing.

#### 8b — Dry-run against production

```bash
TWENTY_API_KEY="$TWENTY_PROD_API_KEY" TWENTY_API_URL="$TWENTY_PROD_URL" \
  python3 run-migrations.py --dry-run
```

Review what will be created. Dependency `[error]` lines for new objects are
expected in dry-run mode — they will not appear in the live run.

#### 8c — Apply to production

```bash
TWENTY_API_KEY="$TWENTY_PROD_API_KEY" TWENTY_API_URL="$TWENTY_PROD_URL" \
  python3 run-migrations.py
```

If a particular migration is destructive (e.g. deletes fields), apply with
`--only <id>` and pause for explicit user confirmation before running it.
For MORPH_RELATION-deleting migrations, see the warning above — use direct
SQL instead.

---

### 9. Layout migrations (if any detail-view layout changes were made on UAT)

Record detail page layouts (`pageLayout → viewFieldGroup → viewField`) are **not**
covered by the metadata migration scripts or by `backfill-page-layouts`. Any
customisations made on UAT via the `manage-record-layout` skill must be replayed
on production using the idempotent SQL scripts in:

```
/home/clive/_Projects/stratum/twenty/source/scripts/stratum/layout-migrations/
  NNN-<object>-layout.sql
```

For each script:

1. **Test on UAT first** — should produce only `NOTICE` lines, no inserts/deletes:
   ```bash
   B64=$(base64 -w0 /home/clive/_Projects/stratum/twenty/source/scripts/stratum/layout-migrations/NNN-xxx.sql)
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
set -a; . /home/clive/_Projects/stratum/.env; set +a
cd /home/clive/_Projects/stratum/twenty/source/scripts/stratum
SOURCE_KEY="$TWENTY_UAT_API_KEY" TARGET_KEY="$TWENTY_PROD_API_KEY" \
  python3 diff-environments.py
```

**Expected result: zero gaps.** If gaps remain, return to Step 8 and resolve them.

#### 10b — Re-run migration status

```bash
TWENTY_API_KEY="$TWENTY_PROD_API_KEY" TWENTY_API_URL="$TWENTY_PROD_URL" \
  python3 run-migrations.py --status
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

### 12. Take production out of maintenance mode

Final step. After all Step 10 verification passes and any Step 11 workflow
recreation is done, restore prod to normal operation.

> **Ask the user:**
>
> "Please clear the Custom Start Command on the production `twenty` service
> in Railway dashboard → Settings → Deploy and save. Railway will redeploy
> with the normal Twenty start command (~10 min). Tell me when the build
> completes and the maintenance page is gone."

If you set the same Custom Start Command on `twenty-worker`, clear it there
too.

Wait for confirmation, then run a final smoke check:

```bash
set -a; . /home/clive/_Projects/stratum/.env; set +a
curl -sS -o /dev/null -w "GraphQL: %{http_code}\n" \
  -H "Authorization: Bearer $TWENTY_PROD_API_KEY" \
  -X POST https://twenty-production-eea0.up.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ currentUser { id email } }"}'
```

Should return 200 with the current user. If you see a 503 still, the
Custom Start Command wasn't fully cleared — ask the user to check.

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
