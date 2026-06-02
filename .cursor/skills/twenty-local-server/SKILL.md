---
name: twenty-local-server
description: Start, stop, restart, and check status of the Twenty CRM local dev stack (Postgres, Redis, Nest API, Vite frontend, Bull worker). Use when the user asks to run Twenty locally, start/stop/restart the dev server, or bring the CRM up or down.
---

# Twenty Local Server Lifecycle

Manage the full local dev stack: **Postgres**, **Redis**, **API** (`:3000`), **frontend** (default `:3001`), and **worker**.

## Quick commands

From repo root:

```bash
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh start     # infra + yarn start
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh stop      # app + Postgres/Redis
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh restart   # full stop, then infra + app
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh status    # ports + services
```

Make executable once: `chmod +x .cursor/skills/twenty-local-server/scripts/twenty-dev.sh`

## Command behavior

| Command | What it does |
|---------|----------------|
| **start** | Start Docker Postgres/Redis (compose or fallback containers), then `yarn start` |
| **stop** | Stop API, frontend, worker, **and** Docker infra (`twenty-dev` compose + `twenty-local-*` containers) |
| **restart** | Full **stop**, then **start** (fresh infra + app) |
| **status** | Report configured ports and what is up |

`stop-all` is an alias for `stop`.

## Defaults

| Service | URL / port |
|---------|------------|
| API | http://localhost:3000 |
| Frontend | http://localhost:3001 |
| Health | http://localhost:3000/healthz |
| Postgres | `localhost:5432` |
| Redis | `localhost:6379` |

Dev login (after `database:reset` seed): **tim@apple.dev** / **tim@apple.dev** (`SIGN_IN_PREFILLED=true` prefills email).

## First-time setup

Run once before first `start`:

```bash
yarn install
bash packages/twenty-utils/setup-dev-env.sh   # Postgres, Redis, .env files
npx nx build twenty-shared
npx nx database:reset twenty-server
```

`setup-dev-env.sh` copies `packages/twenty-server/.env` and `packages/twenty-front/.env` from examples.

## Start

```bash
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh start
```

Starts supporting infra first, then:

```bash
yarn start   # server + front via nx; worker after :3000 is up
```

### Automated shells: `yarn start` hangs on `generateBarrels`

In non-interactive/automated shells, `yarn start` (and any `npx nx start ...`) re-runs the
`^build` dependency, which gets stuck on `nx run twenty-shared:generateBarrels` and never binds
`:3000`. This is expected here. When the script's `yarn start` stalls (no `Nest application` /
`ready in` after ~1–2 min and `generateBarrels` is still running), do **not** wait — stop it,
prebuild shared/ui once, then launch each service **directly** (bypassing Nx so it can't
re-trigger the build):

```bash
# 1. Stop the stalled launcher + infra stays up
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh stop
docker start twenty-local-pg twenty-local-redis   # keep infra; stop also tore it down

# 2. Prebuild shared + ui (one-off bypass, see generateBarrels section below)
npx tsx packages/twenty-shared/scripts/generateBarrels.ts
cd packages/twenty-shared && npx vite build && npx tsgo -p tsconfig.lib.json --declaration --emitDeclarationOnly --noEmit false --outDir dist --rootDir src && cd ../..
npx tsx packages/twenty-ui/scripts/generateBarrels.ts
cd packages/twenty-ui && npx vite build && cd ../..

# 3. Start each service directly (run each in its own background shell)
cd packages/twenty-server && NODE_ENV=development npx nest start --watch                                   # API :3000
cd packages/twenty-front  && REACT_APP_PORT=3003 npx vite                                                  # frontend (match FRONTEND_URL port)
cd packages/twenty-server && NODE_ENV=development npx nest start --watch --entryFile queue-worker/queue-worker  # worker
```

Use the frontend port from `FRONTEND_URL` in `packages/twenty-server/.env` (e.g. `3003`), not the
`3001` default. Verify with `curl -sf http://localhost:3000/healthz`.

> **Note:** `npx nx start twenty-server` / `npx nx start twenty-front` also depend on `^build` and
> will hit the same hang in automated shells. Prefer the direct `nest` / `vite` commands above.
> Avoid double-starting the API — a second `nest start` on a live `:3000` fails with `EADDRINUSE`.

## Stop

Stops **everything** Twenty uses locally (not just the Node processes):

```bash
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh stop
```

Equivalent infra teardown:

```bash
bash packages/twenty-utils/setup-dev-env.sh --down
```

## Restart

Full teardown then cold start (infra + app):

```bash
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh restart
```

Does not re-run migrations or reseed unless you run `npx nx database:reset twenty-server` separately.

## Port conflicts

If `setup-dev-env.sh` fails with **port 5432 already allocated** (SSH tunnel, local Postgres), use alternate Docker containers and update `packages/twenty-server/.env`:

```env
PG_DATABASE_URL=postgres://postgres:postgres@localhost:5433/default
REDIS_URL=redis://localhost:6380
```

The lifecycle script creates `twenty-local-pg` / `twenty-local-redis` on 5433/6380 when compose cannot bind 5432/6379.

If **3001** is busy (e.g. another app), set frontend port before start:

```bash
export REACT_APP_PORT=3003
# and match the API CORS/redirect setting:
# FRONTEND_URL=http://localhost:3003  (in packages/twenty-server/.env)
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh start
```

## Verify running

```bash
bash .cursor/skills/twenty-local-server/scripts/twenty-dev.sh status
curl -sf http://localhost:3000/healthz
```

Open the frontend URL from `status` or `FRONTEND_URL` in server `.env`.

## When Nx hangs on `generateBarrels`

Some automated shells hang on `nx run twenty-shared:generateBarrels`. This affects **any** Nx
target that depends on `^build`, including `nx build`, `yarn start`, and `npx nx start <project>`.
Bypass for a one-off build:

```bash
npx tsx packages/twenty-shared/scripts/generateBarrels.ts
cd packages/twenty-shared && npx vite build && npx tsgo -p tsconfig.lib.json --declaration --emitDeclarationOnly --noEmit false --outDir dist --rootDir src
npx tsx packages/twenty-ui/scripts/generateBarrels.ts
cd packages/twenty-ui && npx vite build
cd packages/twenty-server && npx nest build --path ./tsconfig.build.json
```

For running the dev stack (not just building), prebuilding alone is not enough — `yarn start`
re-triggers `generateBarrels` anyway. Use the direct `nest` / `vite` start commands in the
[Automated shells](#automated-shells-yarn-start-hangs-on-generatebarrels) section instead. Prefer
`yarn start` in the user's own terminal when Nx is unreliable.

## Reset database (optional)

```bash
npx nx database:reset twenty-server
```
