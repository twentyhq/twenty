# Self-Hosted Smoke Test

The portable skills claim that a user can scaffold and develop a Twenty app against a self-hosted instance. This is how that claim is checked by hand. CI covers installation (`ci-agent-skills.yaml`); this covers the workflow the installed skills describe, which needs a running Twenty instance and cannot run on a CI runner.

Run it when `create-app`, `develop-app`, or `manage-app` guidance changes in a way that affects the scaffold or sync flow.

## Install the Distribution

Build from a checkout and install the skills into the agent used for this run:

```bash
npx nx run twenty-agent-skills:build
npx skills add ./packages/twenty-agent-skills/dist --skill create-app develop-app manage-app
```

After the first successful publish from `main`, the same distribution is available at `https://github.com/twentyhq/twenty/tree/agent-skills`. Record the source revision and installation method with each new run. The recorded run below predates the distribution migration and documents the app workflow only.

## 1. Bring up a self-hosted instance

Any instance works. For a local one from a checkout of this repository:

```bash
bash packages/twenty-utils/setup-dev-env.sh
npx nx database:reset twenty-server   # init only builds the schema; reset also seeds
npx nx start twenty-server
```

Wait for `http://localhost:3000/healthz` to return 200. This instance is self-hosted for the purposes of the test: a non-`twenty.com` host, over plain HTTP, on a port the user chose.

## 2. Authenticate a remote

The scaffolder reuses an existing remote's credentials when one matches the target URL, which is what makes the rest of the run non-interactive. Add one with an API key from the instance's settings:

```bash
yarn twenty remote:add --url http://localhost:3000 --api-key <api-key> --as selfhosted
```

`DEV_API_KEY` in `twenty-sdk` does not work here. It is signed for the `twenty-app-dev` Docker image's `APP_SECRET`, so a locally built server with its own secret rejects it as `Token invalid`.

## 3. Scaffold, following `create-app`

```bash
npx create-twenty-app@latest smoke-crm --url http://localhost:3000 \
  --name smoke-crm --display-name "Smoke CRM" --description "Self-hosted smoke test app"
```

Expect `Authenticating -> Reusing existing credentials`, then `Application created successfully`. Confirm the app registered on the instance rather than only on disk:

```sql
select id, "universalIdentifier", version from core.application;
```

One row must carry the `APPLICATION_UNIVERSAL_IDENTIFIER` from the generated `src/constants/universal-identifiers.ts`.

## 4. Develop, following `develop-app`

```bash
cd smoke-crm
yarn twenty dev:add object    # interactive; needs a TTY
yarn twenty apply
```

`apply` prints a plan and then `Synced <app name>`. Confirm the entity reached the instance:

```sql
select "nameSingular", "namePlural" from core."objectMetadata" where "nameSingular" = 'ticket';
select table_schema || '.' || table_name from information_schema.tables where table_name ilike '%ticket%';
```

Both must return a row. The second proves the workspace migration ran and the physical table exists, which a successful sync message alone does not.

## Recorded run

Executed against a locally built server on `http://localhost:3000`, Node 24.16.0:

- Scaffold reused the `selfhosted` remote credentials, no browser OAuth, and reported `Application created successfully`.
- `core.application` carried the scaffolded identifier `e606ca1a-4035-4c20-87ac-f49e5af6f05c` at `0.1.0`.
- `dev:add object` generated `src/objects/ticket.ts` plus its view, record-page fields, navigation menu item, and record page layout.
- `yarn twenty apply` reported `Plan: 50 to add, 0 to change, 0 to destroy` and `Synced Smoke CRM (5 files)`.
- `core."objectMetadata"` held `ticket` / `tickets`, `core."navigationMenuItem"` held `ticket`, and the physical table `_ticket` existed in the workspace schema.

Note for whoever runs this next: `create-twenty-app` still calls `yarn twenty dev --once` internally during its install step, while the skills direct agents to `yarn twenty apply`. That is the scaffolder's own behavior, not skill guidance.
