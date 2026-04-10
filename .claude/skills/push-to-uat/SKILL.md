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

### 7. Run TypeORM migrations (if new migration files were merged)

If the push included a merge from upstream that added new migration files,
run migrations via SSH:

```bash
railway environment uat
cd /home/clive/_Projects/stratum/twenty && railway ssh --service twenty -- \
  "cd /app && yarn database:migrate:prod"
```

Check the output for any errors before continuing.

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
