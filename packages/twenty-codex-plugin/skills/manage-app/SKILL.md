---
name: manage-app
description: Use when the user wants to manage or troubleshoot tooling, remotes, sync, build, deploy, logs, CI/CD, or operational workflows for an existing Twenty app.
---

# Boundaries

Do not scaffold a new app here. Use `$create-app` when the app does not exist.

Do not add or modify app entities here. Use `$develop-app` for objects, fields, logic functions, roles, views, navigation, page layouts, skills, agents, connection providers, and front component registration.

Do not prepare marketplace README, screenshots, logos, or npm listing copy here. Use `$publish-app` for public listing work.

Do not retrieve CRM records here. Use `$use-twenty-mcp` for workspace data retrieval.

# Operating Rules

First confirm the current directory is a Twenty app:

```bash
test -f package.json
test -f src/application-config.ts
```

Inspect current app and scripts before running operational commands:

```bash
sed -n '1,220p' package.json
yarn twenty remote list
```

Treat deploys, uninstalls, production remote changes, and production syncs as externally visible actions. Ask for explicit confirmation before running them when the target is production or user data could be affected.

# Remotes

A remote is a Twenty server that the app can sync or deploy to. Credentials are stored locally in `~/.twenty/config.json`.

Common commands:

```bash
# Add a remote interactively.
yarn twenty remote add

# Connect to a local Twenty server.
yarn twenty remote add --local

# Add a remote non-interactively.
yarn twenty remote add --api-url https://your-twenty-server.com --api-key $TWENTY_API_KEY --as production

# List configured remotes.
yarn twenty remote list

# Switch the active remote.
yarn twenty remote switch <name>
```

When the user says "prod", "production", or "workspace de prod", identify the target remote before syncing or deploying. If it is missing, add it with `--as production` or the user-provided name.

# Development Sync

Use watch mode for interactive development:

```bash
yarn twenty dev
```

Use one-shot mode for agents, scripts, CI, and quick verification:

```bash
yarn twenty dev --once
```

Both modes require an authenticated remote. If authentication fails, re-add or switch the remote before retrying.

# Troubleshooting

Start by identifying which layer is failing:

- Remote/authentication.
- Dev sync or one-shot sync.
- Build/package generation.
- Deploy/upload/install.
- Runtime function execution.
- CI/CD environment or secrets.

Collect the minimum useful context before changing configuration:

```bash
sed -n '1,220p' package.json
sed -n '1,220p' src/application-config.ts
yarn twenty remote list
yarn twenty dev --once --verbose
```

For remote or authentication issues:

- Check that the active remote is the intended workspace or server.
- Re-run `yarn twenty remote add --local` for local app-dev servers.
- Re-run `yarn twenty remote add --api-url <url> --as <name>` for remote servers.
- Avoid overwriting a production remote until the target URL is confirmed.

For sync issues:

- Prefer `yarn twenty dev --once --verbose` to get a bounded failure.
- Check generated type or schema errors before editing app entities.
- If the app depends on a changed data model, use `$develop-app` to fix the entity definitions.

For build or deploy issues:

- Run `yarn twenty build` before `yarn twenty deploy`.
- Check `package.json` version when updating an already deployed app.
- Confirm the deploy target with `yarn twenty deploy --remote <name>` instead of relying on the active remote when production is involved.

For runtime behavior:

- Use `yarn twenty logs` to inspect function execution logs.
- Use `yarn twenty exec -n <function-name> -p '<json>'` to reproduce a logic function with a controlled payload.

For CI/CD failures:

- Check `.github/workflows/`.
- Confirm `TWENTY_DEPLOY_URL` points to a reachable server from the runner.
- Confirm `TWENTY_DEPLOY_API_KEY` is configured as a secret, not committed in source.

# Build And Deploy

Build before deploy when the user asks for release readiness or when debugging packaging issues:

```bash
yarn twenty build
```

Deploy a tarball app to a configured server:

```bash
yarn twenty deploy
yarn twenty deploy --remote production
```

Before deploying an update, check that `package.json` has a strictly higher semver `version` than the currently deployed version. Re-deploying the same version is rejected.

Use `$publish-app` instead when the user wants npm marketplace publishing, listing copy, screenshots, or public app store metadata.

# Logs, Exec, And Cleanup

Use function logs when debugging runtime behavior on the connected server:

```bash
yarn twenty logs
yarn twenty logs -n <function-name>
```

Run a logic function manually when testing behavior without its trigger:

```bash
yarn twenty exec -n <function-name>
yarn twenty exec -n <function-name> -p '{"key":"value"}'
```

Uninstall only after confirmation:

```bash
yarn twenty uninstall
yarn twenty uninstall --yes
```

# CI/CD

Apps generated with `create-twenty-app` can use GitHub Actions for CI and CD. For deployment automation, check the app's `.github/workflows/` files and configure:

- `TWENTY_DEPLOY_URL`
- `TWENTY_DEPLOY_API_KEY`

Do not put API keys in source files. Use the repository or CI secret store.
