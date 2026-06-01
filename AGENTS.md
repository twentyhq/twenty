# Twenty CRM — Agent Notes

See `CLAUDE.md` and `.cursor/rules/` for day-to-day development commands (lint, test, Nx targets, database operations).

## Cursor Cloud specific instructions

### Node.js version

The repo requires **Node `^24.5.0`** (`package.json` `engines`). Cloud VMs may ship `/exec-daemon/node` at v22, which wins on `PATH` unless overridden.

- Install/use Node 24 via nvm, then prepend it on `PATH` before any `yarn` / `npx` command (this environment adds that to `~/.bashrc`).
- Verify with `node -v` → `v24.x`.

### Infrastructure (Postgres + Redis)

First-time (or after `--reset`) setup from repo root:

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker
```

- Requires **Docker** with access to `unix:///var/run/docker.sock` (if you see permission errors, `sudo chmod 666 /var/run/docker.sock` or add the user to the `docker` group).
- Compose file: `packages/twenty-docker/docker-compose.dev.yml` (Postgres **5432**, Redis **6379**, user/password `postgres` / `postgres`, DB `default`).
- Copies `packages/twenty-front/.env.example` → `.env` and `packages/twenty-server/.env.example` → `.env`.

### Database seed (first run / clean DB)

After infra is up and dependencies installed:

```bash
npx nx build twenty-shared
npx nx run twenty-server:database:reset
```

`database:reset` depends on a **built** `twenty-server` (`dist/`) and **`twenty-emails`** (`dist/index.js`). If `nx run twenty-server:database:reset` appears to hang with no output for many minutes, build dependencies manually (see `CLAUDE.md` / `packages/twenty-server/project.json`) or run the truncate/init/migrate/seed steps via `node dist/...` in `packages/twenty-server`.

### Running the CRM stack

| Service | Port | Start |
|--------|------|--------|
| **twenty-server** (API) | 3000 | `npx nx start twenty-server` or `yarn start` |
| **twenty-front** (UI) | 3001 | `npx nx start twenty-front` or `yarn start` |
| **Worker** (BullMQ) | — | `npx nx run twenty-server:worker` (included in `yarn start` after `:3000` is up) |

- **`yarn start`** runs server + front + worker (good default for full-stack work).
- Health check: `curl http://localhost:3000/healthz`
- Dev sign-in: open `http://localhost:3001`, **Continue with Email**, prefilled **`tim@apple.dev` / `tim@apple.dev`** when `SIGN_IN_PREFILLED=true` in `packages/twenty-server/.env` (seeded “Apple” workspace).

Use **tmux** for long-running dev servers in Cloud Agent VMs.

### Nx / build gotchas

- Some `nx run …` invocations can stall for a long time with little output in this environment; `NX_DAEMON=false` helps for read-only commands like `nx show project`.
- `twenty-shared` / `twenty-emails` / `twenty-ui` builds are pulled in automatically when using `yarn start` (`dependsOn: ["^build"]`).
- `twenty-server` lint depends on `twenty-oxlint-rules:build` (`dist/oxlint-plugin.mjs`); build with the `esbuild` command in `packages/twenty-oxlint-rules/project.json` if Nx build is slow.

### Lint and test (quick smoke)

Standard commands are in `CLAUDE.md`. Examples:

```bash
npx nx lint:diff-with-main twenty-front
npx nx lint:diff-with-main twenty-server
cd packages/twenty-shared && npx jest src/utils/validation/__tests__/isDefined.test.ts --config jest.config.mjs
```

### `.cursor/environment.json`

This repo’s Cloud snapshot may run `yarn install`, `setup-dev-env.sh`, and `database:reset` on environment start. The **update script** only refreshes Yarn dependencies; it does not start Docker or the app (see sections above).
