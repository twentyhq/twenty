# AGENTS.md

Twenty is an open-source CRM built as an Nx monorepo managed with Yarn 4.
See `CLAUDE.md` and `README.md` for the full command reference (dev, test,
lint, build, database, GraphQL). This file only captures durable,
non-obvious guidance for agents working in the Cursor Cloud environment.

## Cursor Cloud specific instructions

### Services (Twenty CRM)
The core product is `twenty-front` (React UI, http://localhost:3001) +
`twenty-server` (NestJS API/GraphQL, http://localhost:3000) + the server
`worker` (BullMQ background jobs), backed by **PostgreSQL 16** and **Redis**
(both required). ClickHouse, SMTP, OAuth, Stripe and AI providers are optional.

- Start everything: `yarn start` (runs front + server + worker concurrently).
- One-time / idempotent env setup (Postgres+Redis, `.env` files, DB migrations):
  `bash packages/twenty-utils/setup-dev-env.sh`. Seed dev data with
  `npx nx database:reset twenty-server`.
- Postgres and Redis run as **local system services** (installed via apt), not
  Docker. `setup-dev-env.sh` auto-detects and starts the local cluster
  (`pg_ctlcluster 16 main start`, `service redis-server start`). Docker is not
  installed in this environment.
- Login (dev): `SIGN_IN_PREFILLED=true`, so click "Continue with Email" — the
  credentials are prefilled. Default account is `tim@apple.dev` /
  `tim@apple.dev` (workspace "Apple").

### Node version (must use Node 24)
The repo requires Node `^24.5.0` (`.nvmrc` pins `24.16.0`). Node 24 is installed
via nvm and set as the default. The cloud image injects `/exec-daemon/node`
(v22) at the front of `PATH`, which would otherwise shadow it, so `~/.bashrc`
prepends the Node 24 bin dir. **Always run commands in a login bash shell**
(e.g. `bash -lc '...'`) so the correct Node and `yarn` (via corepack) are used.

### Critical gotcha: nx hangs unless `NODE_NO_WARNINGS=1` is set
nx forces `FORCE_COLOR=true` on child processes, but the cloud image sets
`NO_COLOR=1` globally. On Node 24 this conflict makes Node emit a process
warning *inside a worker thread* (`@prettier/sync`, used by
`twenty-shared/scripts/generateBarrels.ts`) that **deadlocks the worker and
hangs the task forever**. This blocks `nx build`, `nx database:init`,
`setup-dev-env.sh`, and `yarn start` (the server build depends on
`twenty-shared`'s `generateBarrels`).

The fix is `export NODE_NO_WARNINGS=1`, which is set in `~/.bashrc` and picked
up by any login shell (`~/.profile` sources `~/.bashrc`, which has no
interactive guard). If you ever see a build/`database:init` step sit at
`> tsx packages/twenty-shared/scripts/generateBarrels.ts` with no progress,
confirm `NODE_NO_WARNINGS=1` is set in the running shell.

### nx daemon
The nx daemon caches the environment from when it first started. If you change
env vars (e.g. the color/warning vars above) and tasks still misbehave, run
`npx nx reset` to restart the daemon so it picks up the new environment.

### Lint / test / build
Use the standard nx commands (documented in `CLAUDE.md`), e.g.
`npx nx lint <project>`, `npx nx test <project>`, `npx nx build <project>`.
`twenty-shared` must be built before `twenty-front` / `twenty-server`.
