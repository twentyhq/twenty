---
name: push-to-uat
description: >
  Pre-push checklist for the uat branch of StratumCM/CRM. Commits pending
  work, pushes to origin/uat, and handles post-deploy Railway steps. Use
  this skill whenever the user asks to push to UAT or deploy to UAT.
  For syncing upstream first, use the sync-upstream skill.
  For running tests, use the run-tests skill.
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# push-to-uat

Push the current state of `uat` to Railway and verify the deploy.

## Repo layout

- Source: `/home/clive/_Projects/stratum/twenty/source/`
- Branch: `uat` → deploys to Railway UAT automatically on push
- `main` → deploys to Railway production

## Checklist

Work through each step in order.

### 1. Confirm you are on `uat`

```bash
git -C /home/clive/_Projects/stratum/twenty/source branch --show-current
```

If not on `uat`, stop and ask the user before switching.

### 2. Check for uncommitted changes

```bash
git -C /home/clive/_Projects/stratum/twenty/source status
```

If there are uncommitted changes, ask the user whether to commit them first or
stash them. Do not push with a dirty working tree.

### 3. Sync upstream (if requested or overdue)

If the user wants to pull in upstream Twenty changes before pushing, run the
`sync-upstream` skill now. Otherwise skip.

### 4. Commit any pending work

If there are staged or unstaged changes to commit:

```bash
git -C /home/clive/_Projects/stratum/twenty/source add <specific files>
git -C /home/clive/_Projects/stratum/twenty/source commit -m "<message>"
```

### 5. Push

```bash
git -C /home/clive/_Projects/stratum/twenty/source push origin uat
```

Railway will detect the push and start a build automatically.

### 6. Wait for the build

Monitor Railway logs for the server to become healthy:

```bash
railway logs --service twenty --environment uat --lines 20
```

The server is ready when the logs contain:
`Successfully registered all background sync jobs!`

### 7. Run instance commands (always — every deploy)

Run this unconditionally after every deploy. It is a strict superset of
"run TypeORM migrations" (the package.json's `database:migrate:prod` is
literally `node dist/command/command run-instance-commands`), and it covers
both:

- New TypeORM migrations merged from upstream.
- Twenty `@RegisteredInstanceCommand` files (DDL + data fixes) — including
  ones that upstream backported into older version folders. The boot-time
  `upgrade` entrypoint walks a forward-only cursor and **silently skips
  newly-inserted past-version commands**; only `run-instance-commands`
  iterates the entire sequence and runs every step that's not yet recorded
  as completed (idempotent — already-done steps print "already executed,
  skipping" and exit immediately).

```bash
railway ssh --service twenty --environment uat -- \
  "cd /app/packages/twenty-server && node dist/command/command.js run-instance-commands --force"
```

`--force` skips the workspace-version safety check (which has its own
cursor-based logic that can fail in the same backport scenario). Inspect
output for any `failed` lines.

If anything new ran, also flush the workspace cache:

```bash
railway ssh --service twenty --environment uat -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flush"
```

### 8. Run any pending upgrade commands

If the `sync-upstream` step identified new upgrade commands, run each one:

```bash
railway ssh --service twenty -- node dist/command/command <command-name>
```

If any command inserted or updated data (views, navigation items, field types),
invalidate the flat entity cache:

```bash
railway ssh --service twenty -- node dist/command/command cache:flat-cache-invalidate --all-metadata
```

### 9. Verify health

```bash
railway logs --service twenty --environment uat --lines 20 \
  | grep -E "(error|Error|FATAL)" | grep -v "Uncompiled message"
```

No output = healthy. Then hard-refresh the browser to confirm the UI looks correct.

## Notes

- Never force-push `uat` or `main`.
- Never merge `uat` → `main` without explicit user instruction.
- Railway UAT URL: `https://twenty-uat-0a4c.up.railway.app`
- Railway production URL: `https://twenty-production-eea0.up.railway.app`
- **APP_VERSION** on both UAT services must match the highest upgrade version in
  the codebase (currently `v1.20.0`). Update via:
  `railway variable set APP_VERSION=vX.Y.Z --service twenty --environment uat --skip-deploys`
  (and same for `twenty-worker`).
- **`railway ssh`** is required to run commands inside the Railway container.
  `railway run` executes locally and will fail with "Cannot find module" errors.
- The sidebar in v1.20+ is fully driven by `navigationMenuItems`. If objects are
  missing after an upgrade, run `cache:flat-cache-invalidate --all-metadata`.
- **Why step 7 is non-negotiable after upstream merges:** Twenty regularly
  backports DDL fixes into past version folders (e.g. `2-2/2-2-instance-command-fast-…-add-logo-to-application.ts`
  arriving in our fork via a v2.4.0 catch-up merge). The boot-time `upgrade`
  cursor walks forward only and won't revisit a version it has already passed.
  `run-instance-commands --force` walks the full sequence and is the only
  reliable way to pick up retroactive additions. Symptom of skipping it:
  `column <Entity>.<field> does not exist` errors at runtime when the entity
  references a column whose backported migration never ran.
