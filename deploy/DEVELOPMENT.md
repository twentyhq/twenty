# Development on another machine

Development belongs on a developer-owned computer, never on the production Mac.
Each developer gets an independent clone, Postgres database, Redis instance,
and local file storage.

## Prerequisites

- Git
- Node matching `.nvmrc`
- Corepack/Yarn
- Docker with Compose v2, or local Postgres 16 and Redis

## Setup

```bash
git clone git@github.com:SpeculativeTechnologies/CRM.git twenty
cd twenty
corepack enable
bash packages/twenty-utils/setup-dev-env.sh --docker
cp deploy/git-hooks/post-merge .git/hooks/post-merge
chmod +x .git/hooks/post-merge
bash deploy/local-schema.sh check
bash deploy/local-data.sh seed
yarn start
```

Open `http://localhost:3001`. The development backend is on port 3000,
Postgres on 5432, and Redis on 6379 **on that developer machine**.

The `--docker` option is required for the team-standard setup. It gives each
machine a predictable local datastore and makes cleanup explicit.

## Verification

Before beginning feature work, verify:

```bash
docker compose -f packages/twenty-docker/docker-compose.dev.yml ps
curl --fail http://localhost:3000/healthz
git status --short --branch
```

Then perform this manual smoke test:

1. Sign in to the local CRM.
2. Create a test person.
3. Refresh and confirm the person remains.
4. Stop the local stack and confirm production remains reachable independently.
5. Restart the local stack and confirm the test person remains only locally.

## Daily use

```bash
git fetch origin
git rebase origin/main
yarn start
```

After pulling schema changes, run:

```bash
bash deploy/local-schema.sh sync
```

This applies shared instance migrations, upgrades every local workspace, clears
stale metadata caches, and displays the resulting upgrade status. It refuses to
run unless the server environment points at the standard localhost development
Postgres and Redis URLs, and it refuses the production checkout explicitly.

The installed post-merge hook normally runs it automatically when a merge
changes entities, instance migrations, or workspace upgrade commands. Run a
read-only status report at any time with:

```bash
bash deploy/local-schema.sh check
```

Before opening a pull request that changes schema, test both paths:

1. Run `bash deploy/local-schema.sh sync` against an existing local database.
2. Reset the disposable local environment and initialize it from scratch:

   ```bash
   bash packages/twenty-utils/setup-dev-env.sh --docker --reset
   bash deploy/local-schema.sh check
   ```

The existing server CI also initializes a clean database and fails when entity
changes would generate an uncommitted instance migration.

## Deterministic local test data

The repository's light development fixture creates one workspace and at most
five records per standard CRM object. It includes people, companies,
opportunities, tasks, notes, workspace members, and their standard
relationships, while skipping the large demo dataset, attachment files, and
demo-only custom objects.

```bash
bash deploy/local-data.sh seed
bash deploy/local-data.sh verify
```

`seed` is safe to rerun: it verifies the existing deterministic workspace
instead of duplicating it. To replace all local data with a fresh fixture:

```bash
bash deploy/local-data.sh reset --yes
```

Reset is intentionally explicit and operates only after `local-schema.sh`
confirms that the standard `twenty-dev` Docker database and Redis are the
targets.

The fixture is the right dataset for CI and for a first run. It is the wrong
dataset for schema work, because it contains only Twenty's standard objects.
Our workspace has seven more (`candidate`, `fellow`, `mentor`, `reviewer`,
`enrollment`, `connection`, `employmentHistory`) and roughly 150 extra fields,
none of which the fixture exercises.

## The development mirror

The mirror is a scrubbed copy of the real CRM. Use it whenever a change touches
entities, instance commands, workspace upgrades, views, or search.

```bash
bash deploy/local-data.sh mirror
```

Stop `yarn start` first; the local database is dropped and rebuilt. The command
replaces it, verifies the scrub, clears the local cache, and runs
`local-schema.sh sync` so the data lands on the commit that is checked out. It
takes a few minutes, most of it transfer.

Sign in at `http://localhost:3001` with any account the command prints and the
password `devmirror`. Every account in a mirror shares that password, so
teammates who have no production account can still sign in.

### What a mirror contains

Kept, because reproducing their shape synthetically is exactly what makes local
schema work unrealistic:

- people, companies, fellows, mentors, candidates, enrollments, connections,
  employment history, opportunities, tasks, notes
- every object and field definition, view, filter, and page layout
- production row counts and relationships throughout

Removed:

- message bodies, subjects, and calendar event titles, descriptions and
  locations, replaced with placeholders of similar length
- email addresses of participants who are not linked to a CRM record or
  workspace member, replaced with stable `@example.invalid` pseudonyms
- timeline activity field diffs, assistant conversations, attachment names
- all credentials: signing keys, sessions, API keys, 2FA methods, OAuth tokens,
  SSO configuration, and application secrets

Message and calendar rows are kept, only emptied. Row counts, foreign keys, and
column types match production, which is the point: a missing workspace field on
a table with 31,000 rows is the failure this dataset is meant to catch.

### A mirror is still confidential

The mirror contains real people, real companies, and real notes the team wrote
about them. It is not public data and it is not anonymized. Treat it like the
CRM itself:

- keep full-disk encryption on
- never commit a dump, attach one to an issue, or upload one anywhere
- run `bash deploy/local-data.sh reset --yes` when you stop working on the
  project, and before returning or reimaging a machine

Dumps in `deploy/.devdata/` are gitignored and expire on their own; the
publisher keeps only the three newest.

### Refreshing and troubleshooting

Each `mirror` run builds a fresh copy from staging, and staging refreshes from
production nightly at 4:15 AM, so a mirror is at most a day behind.

Check what you currently have:

```bash
bash deploy/local-data.sh verify
```

This reports the fixture's record counts, or the mirror's build time and source
commit, depending on which dataset is installed.

If the machine cannot reach the staging host, have someone publish a dump and
hand it over out of band:

```bash
bash deploy/devdata-publish.sh              # on the staging host
bash deploy/local-data.sh mirror --from-file ~/Downloads/twenty-devdata.dump
```

A dump that fails verification is refused and the local database is wiped, so a
raw production dump cannot be installed by mistake.

## Resetting local data

This deletes only that developer machine's `twenty-dev` Docker volumes:

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker --reset
```

Never run setup or reset commands on Ben's production Mac.
