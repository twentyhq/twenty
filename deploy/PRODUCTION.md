# Production on this Mac

Production is the live CRM. It currently runs from:

```text
/Users/ben/Deploy/twenty
```

launchd starts `deploy/serve-public.sh` from that clone. The native production
services use backend port 3000, frontend port 3010, Postgres port 5432, and
Redis port 6379.

## Rules

- The deploy clone is not a development checkout.
- Do not edit files there.
- Do not run tests, development setup, or reset commands there.
- Deploy only reviewed commits already merged into `origin/main`.
- Use `git pull --ff-only`; never merge a feature branch in the deploy clone.
- Run staging first.

## Deploy

```bash
cd /Users/ben/Deploy/twenty
git fetch origin
git status --short --branch
git pull --ff-only origin main
```

The post-merge hook runs dependency installation, database migration, workspace
upgrade, and cache invalidation when schema files changed. Treat any error as a
failed deployment.

If frontend files changed:

```bash
bash deploy/publish-frontend.sh
```

Record the result:

```bash
git rev-parse HEAD
curl --fail http://127.0.0.1:3000/healthz
curl --fail http://127.0.0.1:3010/healthz
```

## Database-changing release

Before pulling:

```bash
cd /Users/ben/Deploy/twenty
bash deploy/backup-db.sh
```

Confirm the dump reports `OK`. After deployment, check application behavior and
the public endpoint before considering the release complete.

## Deploying without SSH

The **Deploy to production** workflow promotes a commit from GitHub.
`production-converge.sh` on this host polls the `production-target` ref and
fast-forwards to it. Nothing reaches into this machine; it only ever pulls.

The workflow refuses a commit that is not merged into `main`, and refuses one
that does not contain whatever staging last ran. Those were previously rules in
this document; they are now checks.

### The approval gate is not in the workflow file

The workflow declares `environment: production`. That only pauses for approval
if the environment has required reviewers configured. **Without that
configuration there is no gate at all and the workflow deploys immediately.**

Configure it once:

```bash
gh api --method PUT repos/OWNER/REPO/environments/production \
  -f 'reviewers[][type]=User' -F "reviewers[][id]=$(gh api user --jq .id)"
```

Then confirm a dispatch actually parks on approval before relying on it.

### Install the converger

```bash
cp deploy/launchd/com.twenty.production-converge.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.twenty.production-converge.plist
```

It logs to `/tmp/twenty-production-converge.log`.

### Why it does not trust git's exit code

The post-merge hook reports migration failure with `|| echo` and still exits 0,
so a failed schema sync leaves `git merge` looking successful. The converger
therefore inspects the merge output for failure markers and checks both health
endpoints before calling a deploy good. Treat that as a workaround: the hook
swallowing failures is worth fixing on its own.

The converger takes a backup before any schema-changing deploy and aborts if
the backup fails. It never rolls back on its own, because reverting code does
not reverse a migration.

## When the converger reports "production is unhealthy after deploying"

This means the merge and the migration already happened. Production is on the
new commit; there is nothing to un-do by re-running anything. Diagnose before
acting:

1. **Check health now.** The backend runs in watch mode, so after a large merge
   it recompiles for a minute or two. The converger polls to a deadline
   (`TWENTY_HEALTH_TIMEOUT`, default 300s), but a very large sync can still
   outrun it — and a slow boot is not a failed deploy.

   ```bash
   curl -sS -o /dev/null -w 'backend %{http_code}\n'  http://127.0.0.1:3000/healthz
   curl -sS -o /dev/null -w 'frontend %{http_code}\n' http://127.0.0.1:3010/healthz
   ```

2. **A 200 on :3010 does not mean the frontend is current.**
   `serve-frontend.mjs` serves the build directory live, so it answers happily
   with a stale bundle. If the deploy changed `packages/twenty-front/` and you
   do not see `frontend republished` in the log, rebuild:

   ```bash
   bash deploy/publish-frontend.sh
   ```

   A stale bundle against a newer backend is the "blank screen / cannot return
   null for non-nullable field" class of failure.

3. **Do not re-run the converger to retry.** Once the checkout is on the target,
   `current_sha == target_sha` and the next tick exits immediately. It cannot
   finish a partial deploy for you.

4. Only if the app is genuinely broken, go to Rollback below.

## Rollback

Application rollback does not automatically reverse database migrations. For a
code-only failure, return to the previously recorded reviewed SHA using a
dedicated rollback branch/PR or another explicitly recorded emergency action.
For a schema/data failure, stop and use the migration-specific recovery plan or
a verified database restore; do not improvise a destructive downgrade.

Backups live in `~/Backups/twenty/` — the nightly `backup-db.sh` dump plus the
pre-deploy dump the converger takes for any schema-changing release. Confirm
which one predates the migration before restoring anything.
