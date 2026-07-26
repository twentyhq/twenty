# Instructions for a coding agent on the deploy host

You are on `spectech-llm`. This machine runs the **live CRM**. Read this whole
file before running anything.

Your task is to install and verify the two convergers that let people deploy
from GitHub without SSH. Work through the phases in order and stop where told.

## What is on this machine

| Path | What it is | Risk |
|---|---|---|
| `~/Projects/twenty` | staging, Docker, project `twenty-staging`, web on 3020 | low, disposable |
| `/Users/ben/Deploy/twenty` | **production**, native services under launchd | live customer data |

Production is native on ports 3000 (backend), 3010 (frontend), 5432, 6379.
Staging is containerised and publishes no database ports. They share this
machine, which is why the isolation matters.

## Hard rules

1. Do not edit files in `/Users/ben/Deploy/twenty`. It is a deploy clone, not a
   development checkout.
2. Do not run tests, dev setup, or reset commands in the production clone.
3. Never repair a schema problem with manual SQL. Never improvise a database
   downgrade. If a migration fails, stop and report.
4. If a script refuses to run because of a guard, stop and report it. Do not
   work around the guard.
5. Report actual command output. A silently skipped verification is worse than
   a failed one. Do not summarise a failure as a pass.
6. Do not proceed from one phase to the next if the previous phase did not
   fully succeed.

## Phase 0: preflight

```bash
hostname
uname -a
ls -d ~/Projects/twenty /Users/ben/Deploy/twenty
docker ps --format '{{.Names}}' | head
launchctl list | grep -i twenty || echo "no twenty agents loaded yet"
```

Report what you find. If either checkout is missing, stop.

## Phase A: install the staging converger

Staging only. Nothing here touches production.

```bash
cd ~/Projects/twenty
git status --short --branch
git pull --ff-only origin main
```

The converger pulls images from GHCR. Without a login every tick fails at the
image check, so verify rather than assume:

```bash
docker login ghcr.io
docker manifest inspect \
  ghcr.io/speculativetechnologies/twenty:f87ae25626ef19f0ad8058f7141659da9366b5c1 \
  >/dev/null && echo "GHCR OK"
```

If that fails, stop and report. Everything downstream depends on it.

Then install the launch agent:

```bash
cp deploy/launchd/com.twenty.staging-converge.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.twenty.staging-converge.plist
```

`RunAtLoad` is false, so nothing runs until the first two-minute tick.

## Phase B: watch the first convergence

This code has never executed anywhere. The first tick is the real test.

`staging-target` currently points at `f87ae25626ef19f0ad8058f7141659da9366b5c1`,
so the first tick should attempt a real convergence.

```bash
tail -f /tmp/twenty-staging-converge.log
```

Success looks like a line reporting convergence, then `staging is now running
f87ae25626...`. Then confirm staging is actually serving:

```bash
curl --fail --silent http://127.0.0.1:3020/healthz && echo "staging healthy"
```

Expected failure modes and what they mean:

| Log line | Cause | Action |
|---|---|---|
| `another staging operation holds the lock` | the 4:15 data refresh is running | normal, wait for the next tick |
| `No image published for <sha>` | not logged in to GHCR, or no image built | redo the GHCR login; report if it persists |
| `no staging-target ref published yet` | ref missing | report; the ref existed when this was written |
| `convergence to <sha> failed; restoring <sha>` | the new image would not come up | expected safety behaviour; report the output above it |
| `ROLLBACK FAILED` | staging is down | stop, report immediately |

**Stop here and report the result.** Do not start Phase C until a convergence
has succeeded and staging is healthy.

## Phase C: production

Only after Phase B succeeded.

### C1. Confirm the approval gate exists

The production workflow declares `environment: production`. That only pauses
for approval if the environment has required reviewers configured. If it is not
configured, GitHub creates the environment implicitly with no protection and
deploys immediately, which is worse than no gate because it looks like one.

The owner configures this from GitHub, not from this machine. Do not proceed
until they confirm that a dispatch of **Deploy to production** parks awaiting
approval. Ask if you do not know.

### C2. Check whether the pending deploy changes the schema

```bash
cd /Users/ben/Deploy/twenty
git fetch origin
git rev-parse HEAD
git diff --name-only HEAD origin/main
git diff --name-only HEAD origin/main |
  grep -E '\.entity\.ts$|database/(commands/upgrade-version-command|typeorm)/' &&
  echo "SCHEMA CHANGE" || echo "no schema change"
```

Report the current SHA and the result. If it reports `SCHEMA CHANGE`, take a
backup and confirm it reports `OK` before going further:

```bash
bash deploy/backup-db.sh
```

### C3. Understand what the next command does

```bash
git pull --ff-only origin main
```

**This is a production deployment.** It is also the only way to get
`production-converge.sh` onto this host, so installing the converger and
deploying whatever is on `main` are the same action. Do not run it casually,
and do not run it if C1 or C2 is unresolved.

The post-merge hook runs migrations during this pull. It reports failure with
`|| echo` and still exits zero, so **a successful `git pull` does not mean the
migration succeeded**. Read the full output. If you see `FAILED` or `reported
an error`, treat the deployment as failed, stop, and report. Do not retry.

Afterwards:

```bash
git rev-parse HEAD
curl --fail http://127.0.0.1:3000/healthz && echo "backend OK"
curl --fail http://127.0.0.1:3010/healthz && echo "frontend OK"
```

If the frontend files changed, also run `bash deploy/publish-frontend.sh`.

Report the SHA, the time, the migration result, and both health results.

### C4. Install the production converger

```bash
cp deploy/launchd/com.twenty.production-converge.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.twenty.production-converge.plist
tail -20 /tmp/twenty-production-converge.log
```

Its first tick should log that no `production-target` ref exists yet, which is
correct and harmless.

The converger assumes production health endpoints are on `127.0.0.1:3000` and
`127.0.0.1:3010`. If C3 showed those responding, this is fine. If production
binds elsewhere, say so: the converger would otherwise report a failed deploy
on a healthy system.

## Uninstalling

```bash
launchctl unload ~/Library/LaunchAgents/com.twenty.staging-converge.plist
launchctl unload ~/Library/LaunchAgents/com.twenty.production-converge.plist
```

Neither converger holds state beyond files in `/tmp` and the `STAGING_IMAGE`
line in `deploy/.env.staging`.

## What to report back

- The output of Phase 0.
- Whether the first staging convergence succeeded, with the log lines.
- Production's SHA before and after, if you reached C3.
- Whether the migration reported anything, quoted exactly.
- Both health endpoint results.
- Anything you were told to stop on.
