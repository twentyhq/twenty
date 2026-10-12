# Operating Rules

These rules apply to every Twenty app task, in every skill and every agent harness. They exist because they have failed before.

This file is the single source of truth for the cross-skill rules. Harness-specific entry points link here instead of restating them, so the rules cannot drift between distributions.

1. **Bounded sync only.** Use `yarn twenty apply` to synchronize app changes. Never `yarn twenty dev` (watch mode). Watch mode leaks file handles and produces ambiguous failure output in agent sandboxes.

2. **Do not run broad validation unless it is requested.** After scaffolding (`create-twenty-app`) or after the CLI generates entities, prefer the bounded command that matches the task: `yarn twenty apply` for app sync, the package's unit-test script for unit tests, and `TWENTY_API_URL=http://localhost:2021 yarn test` for the full integration suite. Integration tests must target the isolated test instance on port `2021`, not the dev instance on port `2020`, unless the user explicitly asks otherwise.

3. **Generate new entities with a CLI.** A CLI produces the file structure, identifiers, SDK imports and boilerplate. Hand-craft an entity file only to modify an existing one, or when no option below can produce it. Take the first option that works:
   1. **The standalone `twenty` CLI, when `command -v twenty` finds it.** Run it directly, not through `yarn`. It works with or without a terminal: with `--no-input` it never prompts and exits with code 2 when a required value is missing. It covers objects, fields, logic functions and front components. For an object, pass the three `--create-*` flags so it also generates the table view, navigation menu item and record page layout that make the object visible in the UI:

      ```bash
      twenty app add object --name invoice --name-plural invoices --create-view --create-navigation-menu-item --create-page-layout --no-input
      twenty app add field --name amount --type NUMBER --object <object-uuid> --no-input
      twenty app add logic-function --name send-invoice --no-input
      twenty app add front-component --name invoice-panel --no-input
      ```

   2. **`yarn twenty dev:add <entityType>`, in an interactive terminal only.** It covers every entity type, but it prompts for each value: in an agent's shell it fails at once with `User force closed the prompt`.
   3. **Neither runs, and the user is available**: ask them to run the exact `yarn twenty dev:add <entityType>` command in their own terminal. For an object, prefer this over writing four files by hand.
   4. **Otherwise, write the file by hand.** Follow the example on the matching docs page (append `.md` to its URL), or an existing file of the same kind in the app, check it against the types exported by `twenty-sdk/define`, and generate every identifier with `crypto.randomUUID()` instead of inventing one.

4. **Confirm destructive operations.** Deploys to production, uninstalls, production remote changes, and production syncs require explicit user confirmation before execution. Treat `--remote production` as user-visible.

5. **Any Twenty instance is a valid target.** The user supplies the workspace or instance URL: managed cloud, self-hosted on a custom HTTPS domain, or localhost over HTTP. Never assume or require a `twenty.com` workspace.

6. **Workspace URLs and credentials stay user-local.** Never bundle workspace-specific MCP URLs in shared or committed files. Bearer tokens, API keys, and OAuth secrets belong in the user's private client config; `TWENTY_DEPLOY_API_KEY` and similar live in CI secret stores, never committed in source.
