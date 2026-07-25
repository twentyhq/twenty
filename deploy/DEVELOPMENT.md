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
bash deploy/update-after-merge.sh
```

The installed post-merge hook normally does this automatically.

## Resetting local data

This deletes only that developer machine's `twenty-dev` Docker volumes:

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker --reset
```

Never run setup or reset commands on Ben's production Mac.
