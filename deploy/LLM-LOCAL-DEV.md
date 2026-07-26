# Instructions for coding agents on a developer machine

Read this before changing anything in this repository. It describes the whole
modification pipeline, from getting a dataset to promoting a change to
production, and the boundaries that are not yours to cross.

Human context is in [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md) and
[DEVELOPMENT.md](DEVELOPMENT.md). This file is the operational version.

## Hard rules

1. Never run anything in `/Users/ben/Deploy/twenty`. That is the live CRM.
2. Never run `setup-dev-env.sh`, `local-schema.sh`, or `local-data.sh` on the
   machine that hosts production. Its datastore ports are production's ports.
   The scripts refuse, but do not rely on that.
3. Never push to `main`, and never deploy. Promotion is the production owner's
   action.
4. Never repair schema drift with manual SQL. Schema changes travel as
   committed instance commands and workspace upgrades.
5. Never copy a mirror dump, or rows from one, anywhere outside the local
   machine. See "Handling mirror data" below.
6. If a command refuses to run because of an environment guard, stop and report
   it. Do not work around the guard.

## Step 0: confirm where you are

```bash
pwd
git status --short --branch
docker compose -f packages/twenty-docker/docker-compose.dev.yml ps
```

You are on a developer machine if the checkout is not
`/Users/ben/Deploy/twenty` and the `twenty-dev` Docker services are running. If
they are not running:

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker
cp deploy/git-hooks/post-merge .git/hooks/post-merge && chmod +x .git/hooks/post-merge
```

Then confirm the schema matches the checked-out commit:

```bash
bash deploy/local-schema.sh check
```

## Step 1: choose a dataset

| Change | Dataset | Command |
|---|---|---|
| UI, copy, frontend state, isolated utilities | fixture | `bash deploy/local-data.sh seed` |
| Entities, instance commands, workspace upgrades, views, search, permissions, anything with a migration | mirror | `bash deploy/local-data.sh mirror` |

The fixture has only Twenty's standard objects. The workspace this fork serves
has seven custom objects and about 150 custom fields on top of them, so a
migration that looks correct against the fixture can still fail in production.
When in doubt, use the mirror.

```bash
bash deploy/local-data.sh mirror
```

Takes a few minutes. It replaces the local database, verifies that the dump was
scrubbed, wipes the database if it was not, and runs `local-schema.sh sync`.
Sign in at `http://localhost:3001` with any account it prints, password
`devmirror`.

Check what is installed at any time with `bash deploy/local-data.sh verify`.

## Step 2: make the change

Follow `CLAUDE.md` for code conventions. For schema changes specifically:

```bash
# after editing entity files
npx nx run twenty-server:database:migrate:generate --name <name> --type <fast|slow>
npx nx run twenty-server:database:migrate

# after editing the GraphQL schema
npx nx run twenty-front:graphql:generate
```

Commit the generated instance command in the same commit as the entity change.
Never edit the `up` or `down` of an instance command that is already on `main`.

## Step 3: verify locally

Run all of these. Report the actual output; do not summarize a failure as a
pass.

```bash
npx nx lint:diff-with-main twenty-server
npx nx lint:diff-with-main twenty-front
npx nx typecheck twenty-server
npx nx typecheck twenty-front
cd packages/twenty-server && npx jest <pattern>
```

Schema changes need both migration paths tested, because they fail differently:

```bash
# 1. upgrade path: an existing database moving to your commit
bash deploy/local-schema.sh sync

# 2. clean path: a database built from nothing at your commit
bash packages/twenty-utils/setup-dev-env.sh --docker --reset
bash deploy/local-schema.sh check
```

The reset wipes local data. Reinstall the dataset afterwards and confirm the
upgrade path again against mirrored data:

```bash
bash deploy/local-data.sh mirror
```

Then exercise the change in the running app (`yarn start`, then
`http://localhost:3001`). For a schema change, confirm the affected records
still load, are editable, and survive a refresh.

## Step 4: open the pull request

```bash
git switch -c yourname/short-description
git push -u origin HEAD
gh pr create --base main
```

State what changed and why, how it was tested, whether it touches the database,
environment variables, permissions, integrations or jobs, and how to roll back.
Attach screenshots for visible UI changes.

Take those screenshots against the fixture, not the mirror. Mirror screenshots
contain real names, companies, and notes, and a pull request is a permanent
public-to-the-team record.

Wait for `ci-fork-status-check` and review. Do not merge your own PR without
review. `deploy/**`, `packages/twenty-server/src/database/**`, auth, roles,
permissions, secrets, integrations, and background jobs require the production
owner's review.

## Step 5 and 6: staging and production

These run on the production Mac and are the production owner's actions. Do not
perform them from a developer machine, and do not perform them on your own
initiative even if you are on that Mac.

The sequence, for reference when reporting readiness:

1. Identify the exact commit SHA to promote.
2. `bash deploy/refresh-staging-from-production.sh --yes`
3. Stage the image tagged with that full SHA and run
   `bash deploy/staging.sh test`.
4. Back up the production database for schema-changing releases.
5. Deploy the same SHA to production.
6. Record the SHA, operator, time, migration result, and smoke-test result.

Your job ends at a reviewed, merged PR plus a clear statement of what needs
verifying on staging.

## Handling mirror data

A mirror has no third-party mailbox content, but it is still the real CRM:
actual people, companies, and internal notes about them.

- Do not paste mirror rows into commits, PR descriptions, issues, comments, or
  commit messages.
- Do not upload a dump or query results anywhere, including to a hosted
  artifact, gist, or paste service.
- Do not include real records in test fixtures. Test data goes in the seeder.
- Prefer aggregate queries when investigating. `count(*)` and `group by` answer
  most questions without reading anyone's record.
- When you are done with the machine, or before it changes hands:

  ```bash
  bash deploy/local-data.sh reset --yes
  ```

If you are asked to share evidence that involves real records, share the query
and the counts, not the rows.

## When something fails

| Symptom | Cause | Action |
|---|---|---|
| Blank screen, "Cannot return null for non-nullable field" | schema behind the checkout | `bash deploy/local-schema.sh sync` |
| `local-schema.sh` refuses to run | not the guarded `twenty-dev` target | stop, report; do not bypass |
| `mirror` reports "not a verified mirror" | the dump was not produced by `devdata-publish.sh` | stop and report; the local database was already wiped |
| `mirror` cannot reach the staging host | no tailnet or SSH access | ask for a dump and use `mirror --from-file` |
| Custom object page is blank | the object has no view rows | create a view for it, then `npx nx run twenty-server:command -- cache:flat-cache-invalidate --metadataName view` |
| Upgrade status reports "behind" or "failed" | a workspace upgrade did not apply | report the exact output; do not patch the database by hand |

Report failures with the command and its real output. A silently skipped
verification step is worse than a failed one.
