---
name: create-an-app
description: Use when the user wants to create, scaffold, run, extend, test, deploy, or troubleshoot a Twenty app with create-twenty-app and the Twenty Apps developer workflow.
---

# Create An App

Use this skill for Twenty Apps work with the official `create-twenty-app` scaffolder, generated app template, and `yarn twenty` app CLI.

## When To Use

Use this when the user asks to:

- Create or scaffold a new Twenty app.
- Start from a Twenty app example such as `postcard` or `hello-world`.
- Prepare app README, npm package copy, marketplace metadata, logo, screenshots, or public visual assets; for the detailed workflow, use the `app-readme-and-visuals` sub-skill.
- Connect Codex or another MCP client to a Twenty workspace.
- Set up the local Twenty app development server.
- Add app entities such as objects, fields, logic functions, front components, roles, skills, agents, views, navigation, page layouts, or OAuth connection providers.
- Run `yarn twenty dev`, `add`, `build`, `typecheck`, tests, remotes, local server commands, deploys, installs, or npm publishing.
- Troubleshoot scaffolding, MCP OAuth authorization, Docker startup, remotes, generated API clients, public assets, or app sync behavior.

## Official References

When exact current behavior matters, verify the latest docs and package version:

- Docs index: `https://docs.twenty.com/llms.txt`
- Getting started: `https://docs.twenty.com/developers/extend/apps/getting-started`
- Architecture: `https://docs.twenty.com/developers/extend/apps/building`
- Data model: `https://docs.twenty.com/developers/extend/apps/data-model`
- Logic functions: `https://docs.twenty.com/developers/extend/apps/logic-functions`
- Front components: `https://docs.twenty.com/developers/extend/apps/front-components`
- Layout: `https://docs.twenty.com/developers/extend/apps/layout`
- Skills and agents: `https://docs.twenty.com/developers/extend/apps/skills-and-agents`
- CLI and testing: `https://docs.twenty.com/developers/extend/apps/cli-and-testing`
- Publishing: `https://docs.twenty.com/developers/extend/apps/publishing`
- MCP server: `https://docs.twenty.com/user-guide/ai/capabilities/mcp`
- OAuth: `https://docs.twenty.com/developers/extend/oauth`
- App connections: `https://docs.twenty.com/developers/extend/apps/connections`
- Package: `npm view create-twenty-app version dist-tags engines`

Twenty Apps are currently documented as alpha, so prefer official docs and local source over memory for edge cases.

## Twenty MCP Server

For MCP setup, prefer the `setup-mcp` skill. Do not assume a fixed workspace domain.

The fastest Codex setup is:

```bash
bash packages/twenty-codex-plugin/scripts/setup-mcp.sh https://<your-workspace-url>
```

The setup helper accepts Twenty Cloud subdomains, custom domains, and localhost development domains:

```bash
bash packages/twenty-codex-plugin/scripts/setup-mcp.sh myworkspace.twenty.com
bash packages/twenty-codex-plugin/scripts/setup-mcp.sh myworkspace.customdomain.com
bash packages/twenty-codex-plugin/scripts/setup-mcp.sh myworkspace.localhost:3001
```

For a local app-dev server created by `create-twenty-app` / `yarn twenty server start`, replace the URL with the local workspace host and port.

For Twenty Cloud or self-hosted workspaces, replace the URL with the workspace endpoint:

```json
{
  "mcpServers": {
    "twenty": {
      "type": "streamable-http",
      "url": "https://<your-workspace-url>/mcp"
    }
  }
}
```

OAuth is the recommended MCP auth method. The client discovers metadata through `/.well-known/oauth-protected-resource/mcp` and `/.well-known/oauth-authorization-server`, dynamically registers with `/oauth/register`, opens the browser for authorization, then uses refreshed bearer tokens. If a client cannot do MCP OAuth, use an API key header, but never commit the key:

```json
{
  "mcpServers": {
    "twenty": {
      "type": "streamable-http",
      "url": "https://<your-workspace-url>/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

The MCP endpoint is `POST /mcp`. A 401 response includes a `WWW-Authenticate` header pointing clients to the path-aware protected resource metadata. OAuth dynamic client registrations are public clients using PKCE; the local repo accepts localhost redirects and known MCP client schemes such as Cursor and VS Code.

After connection, use the Twenty MCP workflow:

```text
get_tool_catalog -> learn_tools -> execute_tool
```

Use `load_skills` for complex workspace tasks. Permissions inherit the authenticated user role for OAuth, or the API-key role for API key connections.

For self-hosted instances, ensure `SERVER_URL` matches the public URL. MCP endpoint URLs, OAuth endpoints, and discovery metadata derive from that value.

## What Twenty Apps Are

Twenty apps extend a workspace with code-managed entities:

- Objects and fields for custom data models.
- Logic functions triggered by HTTP routes, cron schedules, database events, or install hooks.
- Front components that render inside Twenty UI surfaces.
- Roles, skills, agents, connection providers, views, navigation, and page layouts.

Each app entity is a TypeScript file with a single `export default`. Prefer `create-twenty-app` and `yarn twenty add` over hand-written boilerplate.

## Prerequisites

Check the environment before scaffolding:

```bash
node -v
corepack enable
docker info
```

Twenty Apps expect:

- Node.js `^24.5.0` or compatible Node 24+.
- Yarn 4 through Corepack.
- Docker for the local app-dev server, unless an existing development-mode Twenty server is available.

If Docker is unavailable, scaffold with `--skip-local-instance` and connect to an existing development server with `yarn twenty remote add`.

## Scaffold A New App

Default minimal app:

```bash
npx create-twenty-app@latest my-twenty-app
cd my-twenty-app
yarn twenty dev
```

Directory names passed to `create-twenty-app` must contain only lowercase letters, numbers, and hyphens. Existing non-empty target directories fail. `--name` cannot be empty.

Useful flags:

```bash
npx create-twenty-app@latest my-twenty-app --example postcard
npx create-twenty-app@latest my-twenty-app --example hello-world
npx create-twenty-app@latest my-twenty-app -n my-app -d "My App" --description "My Twenty app"
npx create-twenty-app@latest my-twenty-app --skip-local-instance
npx create-twenty-app@latest my-twenty-app --yes
```

`--yes` auto-confirms scaffolder prompts such as starting an existing or new local server. `--skip-local-instance` skips local server setup and leaves remote authentication as a manual next step.

When exact version matters, compare npm and the local repo:

```bash
npm view create-twenty-app version dist-tags --json
node -p "require('./packages/create-twenty-app/package.json').version"
```

## Examples

Use examples when the user wants realistic app patterns instead of a minimal template:

```bash
npx create-twenty-app@latest postcard-app --example postcard
npx create-twenty-app@latest hello-world-app --example hello-world
```

The scaffolder downloads examples from `twentyhq/twenty`, using the latest GitHub release tag when available and falling back to `main`. Example names must be simple directory names, not paths. If example download fails, the CLI prompts to fall back to the base template.

Prefer `postcard` when the user needs a rich reference: it demonstrates custom objects and fields, a scoped role, app variables, secret server variables, install functions, front components, views, navigation, page layout, a skill, and an agent.

## Local Instance And Auth

When prompted to set up a local Twenty instance, choose yes unless the user already has one. The local app-dev server runs on port `2020`.

Use the seeded demo credentials when the browser opens:

```text
Email: tim@apple.dev
Password: tim@apple.dev
```

After login, authorize the app in the browser so the CLI can create the `local` remote and sync to the workspace. If OAuth is skipped or fails:

```bash
yarn twenty remote add --local
```

Open the developer apps page:

```text
http://localhost:2020/settings/applications#developer
```

The application registration is server-level. Installing the app creates a workspace-scoped application that points to that registration.

## Development Commands

Interactive watch mode:

```bash
yarn twenty dev
```

Verbose development output:

```bash
yarn twenty dev --verbose
yarn twenty dev --debug
```

One-shot sync for scripts, CI, hooks, and agent workflows:

```bash
yarn twenty dev --once
```

`--once` and `--watch` are mutually exclusive. Watch mode is the default. `yarn twenty dev` requires a Twenty server running in development mode; production servers reject dev sync requests.

Build, package, and typecheck:

```bash
yarn twenty build
yarn twenty build --tarball
yarn twenty typecheck
```

## Add App Entities

Use the CLI generator for new entities:

```bash
yarn twenty add
yarn twenty add object
yarn twenty add frontComponent
yarn twenty add logicFunction
yarn twenty add connectionProvider
yarn twenty add view --path src/custom-folder
```

Supported entity types are:

```text
object field logicFunction frontComponent role skill agent connectionProvider view navigationMenuItem pageLayout pageLayoutTab
```

By default files are created under `src/<entity-folder>/`, where folder names are kebab-case plurals such as `objects`, `logic-functions`, `front-components`, `navigation-menu-items`, `page-layouts`, and `connection-providers`. Front components use `.tsx`; other generated entities use `.ts`.

For objects, accept the companion prompt unless the object is intentionally technical. It creates:

- An index view.
- A record-page-fields view.
- A navigation menu item.
- A record page layout.

For connection providers, the CLI also tries to append `<NAME>_CLIENT_ID` and `<NAME>_CLIENT_SECRET` to `defineApplication.serverVariables`; if it cannot safely edit the app config, it prints the snippet to add manually.

All generated universal identifiers must be valid UUID v4 values. Do not reuse identifiers across entities.

## Generated Project Shape

Important files in a scaffolded app:

- `package.json`: app package metadata, Yarn 4 package manager, `twenty` script, lint/test scripts, and `twenty-sdk` / `twenty-client-sdk` dependencies pinned to the scaffolder version.
- `src/application-config.ts`: required `defineApplication()` config.
- `src/default-role.ts`: default logic-function role.
- `src/constants/universal-identifiers.ts`: generated UUIDs plus display name and description constants.
- `src/__tests__/global-setup.ts`: writes `~/.twenty/config.test.json`, uninstalls the app, then runs `appDevOnce`.
- `src/__tests__/schema.integration-test.ts`: verifies app install and basic `CoreApiClient` CRUD.
- `vitest.config.ts` and `tsconfig.spec.json`: integration test configuration.
- `.github/workflows/ci.yml`: CI workflow that starts a Twenty app-dev server and runs tests.
- `.github/workflows/cd.yml`: deploy/install workflow using `TWENTY_DEPLOY_API_KEY`.
- `public/`: public assets included in dev sync and builds.
- `LLMS.md`, `AGENT.md`, `CLAUDE.md`: agent guidance included in the template.

The template stores `gitignore` and `github/` without leading dots because npm strips dotfiles from published packages; the scaffolder renames them to `.gitignore` and `.github/`.

When the task turns to README content, npm package copy, marketplace metadata, logo, screenshots, or public visual assets, load the `app-readme-and-visuals` sub-skill.

## App Configuration Patterns

Use `defineApplication()` for app metadata:

- `universalIdentifier`
- `displayName`
- `description`
- `defaultRoleUniversalIdentifier`
- `applicationVariables`
- `serverVariables`
- marketplace metadata such as logo and screenshots when publishing

`applicationVariables` are app-managed configuration values. `serverVariables` are filled by the server admin on the application registration; mark secrets with `isSecret: true` and required values with `isRequired: true`.

The base template default role grants broad read/update/soft-delete permissions and denies destroy. For real apps, prefer scoped roles like the `postcard` example: grant only the object, field, and permission flags the functions actually need.

## Data, Logic, UI, And Layout

Use SDK definitions consistently:

- Data model: `defineObject`, `defineField`, and `defineRole`.
- Logic: `defineLogicFunction`, `definePreInstallLogicFunction`, and `definePostInstallLogicFunction`.
- Front UI: `defineFrontComponent`.
- Layout: `defineView`, `defineNavigationMenuItem`, `definePageLayout`, and `definePageLayoutTab`.
- AI: `defineSkill` and `defineAgent`.
- OAuth-style integrations: `defineConnectionProvider`.

Logic functions can use HTTP route, cron, and database event trigger settings. Install functions are useful for setup and seeding, but post-install is skipped in local dev sync because the dev server syncs files directly.

Front components run in sandboxed UI surfaces. Keep them responsive to fixed widget dimensions; avoid internal scrolling unless the component is specifically meant for a canvas tab. Use `CoreApiClient`, `MetadataApiClient`, and front-component helpers from the Twenty client SDK rather than ad hoc HTTP calls when possible.

Views should usually have navigation. Creating a view without a `navigationMenuItem` can make the view hard to discover in the left sidebar.

## Connections With OAuth

Use connection providers when a Twenty app needs to act on a user's behalf in a third-party service such as Linear, GitHub, or Slack.

Generate the starting files with:

```bash
yarn twenty add connectionProvider
```

A working OAuth connection needs:

- A `defineConnectionProvider({ type: 'oauth', oauth: ... })` file.
- Matching `serverVariables` on `defineApplication()` for the OAuth client ID and secret.
- A third-party OAuth app whose redirect URI is `<SERVER_URL>/apps/oauth/callback`.

Key rules:

- `type: 'oauth'` is the only supported connection provider type today.
- `clientIdVariable` and `clientSecretVariable` are variable names, not secret values.
- OAuth client credentials belong in `serverVariables`, not `applicationVariables`, because they are server-wide and configured once on the app registration by a server admin.
- Keep `usePkce` enabled unless the provider rejects PKCE.
- If the provider expects form data at the token endpoint, set `tokenRequestContentType: 'form-urlencoded'`.

In logic functions, read connections with `listConnections({ providerName })` or `getConnection(id)` from `twenty-sdk/logic-function`. Access tokens are refreshed before being returned. For HTTP route triggers with an authenticated user, prefer the request user's connection; for cron and database event triggers, prefer workspace-shared connections because there is no request user.

## Public Assets And Bundling

Files in `public/` are automatically synced in dev mode and included in builds. They are served publicly without authentication, so do not put secrets there.

Use `getPublicAssetUrl` from `twenty-sdk/define` when a logic function or front component needs the resolved URL for a public asset.

The build process uses esbuild to bundle each logic function and front component:

- Logic functions run in Node.js and can use Node built-ins.
- Front components run in a Web Worker and must use browser-compatible dependencies.
- `twenty-client-sdk/core` and `twenty-client-sdk/metadata` are provided by the runtime and resolved by the server.

## Testing And CI

Run integration tests after a development-mode server is available:

```bash
yarn twenty server start
yarn test
yarn test:watch
```

The generated test setup requires:

```bash
TWENTY_API_URL=http://localhost:2020
TWENTY_API_KEY=<api-key>
```

For an isolated test instance:

```bash
yarn twenty server start --test
yarn twenty remote add --test --api-url http://localhost:2021 --api-key "$TWENTY_API_KEY" --as local
```

The default test instance uses port `2021` and writes credentials to `~/.twenty/config.test.json`.

Use the programmatic CLI APIs from `twenty-sdk/cli` in tests when useful, for example `appDevOnce`, `appBuild`, `appDeploy`, `appInstall`, and `appUninstall`.

## Manage The Local Server

Use the app CLI after scaffolding:

```bash
yarn twenty server start
yarn twenty server start --port 3030
yarn twenty server status
yarn twenty server logs
yarn twenty server logs --lines 100
yarn twenty server stop
yarn twenty server reset
yarn twenty server upgrade
yarn twenty server upgrade <version>
```

For an isolated test instance:

```bash
yarn twenty server start --test
yarn twenty server status --test
yarn twenty server logs --test
yarn twenty server reset --test
```

`server status` prints the local URL and seeded login when healthy. Data persists in Docker volumes across restarts. `yarn twenty server reset` deletes the container and volumes; use it only when wiping local app-dev data is intentional. If a server container already exists on a different port, reset it before changing ports.

## Remotes And Authentication

Manage remotes with:

```bash
yarn twenty remote add
yarn twenty remote add --local
yarn twenty remote add --api-url https://your-twenty-server.com --api-key "$TWENTY_API_KEY" --as production
yarn twenty remote add --test --api-url http://localhost:2021 --api-key "$TWENTY_API_KEY" --as local
yarn twenty remote list
yarn twenty remote status
yarn twenty remote switch <name>
yarn twenty remote remove <name>
```

Credentials are stored in `~/.twenty/config.json`; test credentials are stored in `~/.twenty/config.test.json`. OAuth is tried first when no API key is provided, then the CLI falls back to prompting for an API key.

## Deploy Or Publish

For private server distribution:

```bash
yarn twenty build
yarn twenty build --tarball
yarn twenty remote add --api-url https://your-twenty-server.com --as production
yarn twenty deploy --remote production
yarn twenty install --remote production
```

For npm marketplace publishing:

```bash
yarn twenty publish
yarn twenty publish --tag beta
yarn twenty catalog-sync --remote production
```

Before publishing to npm:

- Add the `twenty-app` keyword to `package.json`; the template does not include it by default.
- Use the `app-readme-and-visuals` sub-skill to prepare README content, `defineApplication()` marketplace fields, `public/logo.png`, and screenshots.
- Set `engines.twenty` when the app requires a minimum Twenty server version.
- Bump `package.json` `version` for each update; servers reject redeploying the same or lower semver version.

## Troubleshooting

If the server does not start:

```bash
docker info
yarn twenty server logs
```

If auth fails, make sure the user is logged in to Twenty in the browser, then run:

```bash
yarn twenty remote add --local
```

If generated types are missing, run a complete sync:

```bash
yarn twenty dev --once
```

If a logic function needs manual execution:

```bash
yarn twenty exec -n <function-name>
yarn twenty exec -u <universal-identifier>
yarn twenty exec -n <function-name> -p '{"name":"Hello"}'
yarn twenty exec --postInstall
yarn twenty exec --preInstall
```

If function behavior is unclear, stream app function logs:

```bash
yarn twenty logs
yarn twenty logs -n <function-name>
yarn twenty logs -u <universal-identifier>
```

Use `yarn twenty server logs` for Docker container logs; use `yarn twenty logs` for app logic-function logs.

If dependencies look broken, delete `node_modules` and reinstall with Yarn.
