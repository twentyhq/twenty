# Runtime access

This file lists secret **names only**. Never put values, tokens, or credential-bearing output here.

## Doppler

- Project: `cwi`
- Configs: `dev` (local development against the disposable Docker Postgres/Redis from `packages/twenty-docker/docker-compose.dev.yml`)
- Owner: project owner

Production configuration lives on the deployment host (`/opt/setu/setu.env`, see `setu/README.md`) and is not managed here.

## Required keys

| Key name | Service | Purpose |
| --- | --- | --- |
| `PG_DATABASE_URL` | server, worker | Postgres connection for the local `default` database |
| `REDIS_URL` | server, worker | Redis connection for queues, pub/sub and stream state |
| `APP_SECRET` | server, worker | Token signing and fallback at-rest encryption key; any long random value for `dev` |

Model provider keys (for example `OPENAI_API_KEY`) are optional. Twenty can also store them as database-backed config variables through the admin panel.

## Optional non-secret settings (Setu chat-first)

These are plain environment variables, not secrets. Defaults apply when they are unset or malformed.

| Name | Default | Effect |
| --- | --- | --- |
| `SETU_AI_ACTIONS_EXECUTION_PAUSED` | unset | `true` stops claiming approved actions and research steps; review, reject, cancel and status keep working |
| `SETU_AI_RESEARCH_WEB_SEARCH` | on | `false` keeps research briefs CRM-only (they say so) |
| `SETU_AI_TASKS_TOKEN_LIMIT_PER_TASK` | `600000` | Token ceiling for one research task |
| `SETU_AI_TASKS_WORKSPACE_DAILY_TOKEN_LIMIT` | `3000000` | Shared daily token ceiling for all research tasks in a workspace |
| `SETU_DEV_CHATGPT_PLAN`, `SETU_DEV_CHATGPT_PLAN_MODELS` | set by `start-local.sh` | Local-development plan provider only; ignored unless `NODE_ENV=development` |

After a fresh database, register the repair crons once (they re-enqueue durable work and recover abandoned runs):

```sh
cd packages/twenty-server
doppler run -p cwi -c dev -- env NODE_ENV=development node dist/command/command.js cron:setu-ai-actions:dispatch
doppler run -p cwi -c dev -- env NODE_ENV=development node dist/command/command.js cron:setu-ai-tasks:dispatch
```

## Trusted commands

Run from the repository root. The coding agent may run these after review, because their output contains no secret values.

```sh
# Build the server, then create, migrate and seed the local database (disposable local DB only)
doppler run -p cwi -c dev -- env NODE_ENV=development NX_DAEMON=false npx nx database:reset twenty-server

# Server on :4000, frontend on :4001, plus the worker (avoids editor tooling on 3000/3001)
setu/dev/start-local.sh
```

URL values must include their scheme: `postgres://…` for `PG_DATABASE_URL` and `redis://…` for `REDIS_URL`.

Postgres and Redis themselves need no secrets:

```sh
docker compose -f packages/twenty-docker/docker-compose.dev.yml up -d
```

Do not use `packages/twenty-utils/setup-dev-env.sh` as is: it copies `.env.example` to `.env`, which the workspace secret policy forbids.

Integration tests (`jest-integration.config.ts`) load the tracked `packages/twenty-server/.env.test`. Do not run them until the owner confirms that file holds only placeholder test values or moves them into Doppler.

## Local-only credentials (not in Doppler)

ChatGPT plan sign-in for local development (`setu/dev/chatgpt-plan.mjs login`) writes a refreshable OAuth token set to `~/.config/setu-dev/chatgpt-plan/credentials.json` (mode `0600`; override the directory with `SETU_DEV_CHATGPT_PLAN_DIR`). Only the owner signs in. Agents may run the script's `status` and `probe` commands, which print no token values, but must never read that file. OpenAI permits plan usage only for personal projects that run locally; never configure a hosted Setu instance with it.

See `/Users/sushant/codes/docs/secrets-and-docker.md`.
