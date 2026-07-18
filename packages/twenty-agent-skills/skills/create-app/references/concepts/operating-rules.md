# Operating Rules

These cross-skill rules apply to every Twenty app task, in every skill and every agent harness. They exist because they have failed before.

1. **One-shot sync only.** Use `yarn twenty apply` (or `yarn twenty dev --once`) to synchronize app changes. Never bare `yarn twenty dev` (watch mode). Watch mode leaks file handles and produces ambiguous failure output in agent sandboxes.

2. **Do not run broad validation unless it is requested.** After scaffolding (`create-twenty-app`) or after the CLI generates entities, prefer the bounded command that matches the task: one-shot sync for app sync, the package's unit-test script for unit tests, and `TWENTY_API_URL=http://localhost:2021 yarn test` for the full integration suite. Integration tests must target the isolated test instance on port `2021`, not the dev instance on port `2020`, unless the user explicitly asks otherwise.

3. **Use `yarn twenty dev:add` for new entities.** It generates correct file structure, UUIDs, SDK imports, and boilerplate. Do not hand-craft entity files unless modifying existing ones or the CLI does not support that entity type.

4. **Confirm destructive operations.** Deploys to production, uninstalls, production remote changes, and production syncs require explicit user confirmation before execution. Treat `--remote production` as user-visible.

5. **Any Twenty instance is a valid target.** The user supplies the workspace or instance URL: managed cloud, self-hosted on a custom HTTPS domain, or localhost over HTTP. Never assume or require a `twenty.com` workspace.

6. **Workspace URLs and credentials are user-local.** Never bundle workspace-specific MCP URLs in shared or committed files. Bearer tokens, API keys, and OAuth secrets are user-local; `TWENTY_DEPLOY_API_KEY` and similar live in CI secret stores, never committed in source.
