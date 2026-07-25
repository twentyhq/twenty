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

## Resetting local data

This deletes only that developer machine's `twenty-dev` Docker volumes:

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker --reset
```

Never run setup or reset commands on Ben's production Mac.
