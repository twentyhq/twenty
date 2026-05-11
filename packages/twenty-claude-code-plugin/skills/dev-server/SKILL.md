---
name: dev-server
description: Use when the user wants to start, restart, reset, inspect, or troubleshoot the local Twenty contributor development stack, including the Twenty server, worker, frontend, Redis, PostgreSQL, database resets, Storybook, email preview, Nx cache errors, Vite white screens, branch checkout/rebase issues, or twenty-shared barrel generation problems.
---

# Dev Server

## Overview

Use this skill for the Twenty monorepo contributor dev server, not for `create-twenty-app` app-dev projects. Work from the repository root unless a troubleshooting step explicitly changes directory.

## Official Baseline

Use the official local setup docs as the baseline when exact setup details matter:

- `https://docs.twenty.com/developers/contribute/capabilities/local-setup`
- `https://docs.twenty.com/developers/contribute/commands`

Contributor setup expects Git, Node 24.5.0 or the repo `.nvmrc` version, Yarn 4 via Corepack, PostgreSQL, and Redis. Do not use `npm` or `pnpm` for dependency installation in this repo. If env files are missing, copy:

```bash
cp ./packages/twenty-front/.env.example ./packages/twenty-front/.env
cp ./packages/twenty-server/.env.example ./packages/twenty-server/.env
```

Run `yarn` after first checkout, branch switches with dependency changes, or lockfile changes.

## Common Commands

| Task | Command |
| --- | --- |
| Check out a PR | `gh pr checkout <pr-id>` |
| Check out main | `git checkout main` |
| Start Redis | `brew services start redis` |
| Stop Redis | `brew services stop redis` |
| Start server | `npx nx start twenty-server` |
| Start worker | `npx nx run twenty-server:worker` |
| Reset database | `npx nx database:reset twenty-server` |
| Start frontend | `npx nx start twenty-front` |
| Email preview | `npx nx start twenty-emails` |
| Front Storybook | `npx nx storybook:serve:dev twenty-front` |
| Front lint fix before push | `npx nx run twenty-front:lint -fix` |

Run long-lived server commands in separate terminal sessions. Keep the sessions open until the user no longer needs the dev server.

## Start Workflow

1. Confirm you are at the Twenty repo root:

```bash
test -f package.json && test -d packages/twenty-front && test -d packages/twenty-server
```

2. For a normal start, run Redis, the server, the worker, and the frontend:

```bash
brew services start redis
npx nx start twenty-server
npx nx run twenty-server:worker
npx nx start twenty-front
```

3. For a clean local state or seed/data issues, reset the database while starting the server stack:

```bash
brew services start redis
npx nx database:reset twenty-server
npx nx start twenty-server
npx nx run twenty-server:worker
npx nx start twenty-front
```

4. Validate the app:

```bash
curl -I --max-time 5 http://localhost:3000
curl -I --max-time 5 http://localhost:3001
```

Expected local endpoints:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- GraphQL: `http://localhost:3000/graphql`
- REST: `http://localhost:3000/rest`

Default demo login:

```text
Email: tim@apple.dev
Password: tim@apple.dev
```

## PR Workflow

For PR review or reproduction:

```bash
gh pr checkout <pr-id>
yarn
brew services start redis
npx nx database:reset twenty-server
npx nx start twenty-server
npx nx run twenty-server:worker
npx nx start twenty-front
```

If the branch and upstream have diverged, inspect local changes first with `git status -sb`, then use:

```bash
git pull --rebase
```

Do not discard local changes unless the user explicitly asks.

## Troubleshooting

Use the smallest fix that matches the symptom, then restart only the affected process when possible.

### Nx Errors

For Nx daemon, graph, cache, or stale workspace errors:

```bash
npx nx reset
```

Then rerun the failed `nx` target.

### Redis

If server startup complains about Redis or cache connectivity:

```bash
brew services start redis
redis-cli ping
```

Stop Redis only when the user asks to shut down local services:

```bash
brew services stop redis
```

### PostgreSQL

If the database is missing, stale, or seed data is broken:

```bash
npx nx database:reset twenty-server
```

If the database server is not running on macOS Intel and the local Twenty Postgres package is used:

```bash
cd packages/twenty-postgres
make provision
```

For a standard Homebrew setup, the official docs use PostgreSQL 16 and create `default` and `test` databases:

```bash
brew services start postgresql@16
psql postgres -c "CREATE DATABASE \"default\";" -c "CREATE DATABASE test;"
```

### Frontend White Screen

If the frontend loads a blank white screen and logs suggest a stale Vite cache:

```bash
rm -r node_modules/.vite
npx nx start twenty-front
```

If the directory is absent, skip removal and restart the frontend.

### twenty-shared Or UI Generation

If imports, generated barrels, `twenty-shared`, or `twenty-ui` outputs look stale, run or restart the frontend:

```bash
npx nx start twenty-front
```

The frontend workflow runs `npx nx run twenty-shared:generateBarrels` and the Twenty UI generation/build steps needed by local development.

### Email Preview

Start the email preview tool with:

```bash
npx nx start twenty-emails
```

### Storybook

Check frontend Storybook with:

```bash
npx nx storybook:serve:dev twenty-front
```

### Pre-Push Style Check

Before pushing frontend changes, run:

```bash
npx nx run twenty-front:lint -fix
```

If the lint command rejects `-fix`, inspect the local Nx target and retry with the repo-supported fix flag.
