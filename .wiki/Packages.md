# Packages and MCP

## MCP Configuration (.mcp.json)

Three MCP servers configured for agent-assisted development:

| Server | Command | Purpose |
|---|---|---|
| `postgres` | `bash -c 'source packages/twenty-server/.env && npx -y @modelcontextprotocol/server-postgres "$PG_DATABASE_URL"'` | Direct database queries |
| `playwright` | `npx @playwright/mcp@latest --no-sandbox --headless` | Headless browser automation |
| `context7` | `npx -y @upstash/context7-mcp` | Current documentation lookup |

**Note**: postgres MCP depends on `packages/twenty-server/.env` having `PG_DATABASE_URL`. No repo doc describes this config.

## twenty-client-sdk

Generated GraphQL client library. Three exports:

| Subpath | Purpose |
|---|---|
| `./core` | Core workspace data client (GenQL generated from `/graphql` schema) |
| `./metadata` | Metadata schema client (GenQL generated from `/metadata` schema) |
| `./generate` | `generateCoreClientFromSchema`, `replaceCoreClient`, `generateMetadataClient` |

**Key behavior**: Core client is a stub until an app is installed/synced or `yarn twenty dev` runs. Dev mode generates the real client from live server schema into the app's `node_modules/twenty-client-sdk`.

**Generation**: `generateMetadataClient` introspects `${TWENTY_API_URL}/metadata`. `generateCoreClientFromSchema` introspects `/graphql`. Both use `@genql/cli`.

## twenty-front-component-renderer

Private package. Renders Twenty app front components in an isolated remote-dom worker.

**Key exports**: `FrontComponentRenderer` (accepts component URL, access token, API URL, SDK client URLs, execution context, host communication API, error callback, color scheme), `createRemoteWorker`, `installStyleBridge`, `exposeGlobals`.

**Build automation**:
- `generate-remote-dom-elements` — generates host/remote wrapper bindings via ts-morph
- `storybook:prebuild` — builds example front-component bundles
- `storybook:build/test` — validates against built examples

**Dependencies**: @remote-dom/core, @remote-dom/react, @quilted/threads, twenty-sdk, twenty-ui, twenty-shared.

## twenty-zapier

Private package. Zapier Platform integration for Twenty record automation.

**Capabilities**:
- Custom authentication against `/metadata` with API key
- Triggers: object name discovery, record ID listing, record event subscription
- CRUD action: dynamic create/update/delete per object type
- REST sampling: `/rest/{objectPlural}?limit:3`
- Webhook subscriptions via metadata GraphQL mutations

**Nx targets**: build, validate, deploy, promote, versions, test.

## twenty-cli (Deprecated)

Legacy CLI package. `deprecate.js` prints deprecation message and exits 1. README instructs `npm uninstall twenty-cli && npm install -g twenty-sdk`. No `bin` entry or working implementation. Automation must not reference this package.

## Root Workspace Scripts

| Script | Command | Purpose |
|---|---|---|
| `docs:generate` | `tsx packages/twenty-docs/scripts/generate-docs-json.ts` | Generate docs JSON |
| `docs:generate-navigation-template` | `tsx packages/twenty-docs/scripts/generate-navigation-template.ts` | Navigation template |
| `docs:generate-paths` | `tsx packages/twenty-docs/scripts/generate-documentation-paths.ts` | Doc path generation |
| `start` | concurrently server + front + worker | Local dev server |

## Workspace Packages (18 total)

```
packages/
├── twenty-front/                      # React SPA
├── twenty-server/                     # NestJS backend
├── twenty-sdk/                        # App SDK + CLI binary
├── create-twenty-app/                 # App scaffolder
├── twenty-client-sdk/                 # Generated GraphQL clients
├── twenty-front-component-renderer/   # Remote-dom UI renderer (private)
├── twenty-shared/                     # Types, constants, metadata enums
├── twenty-ui/                         # Shared component library
├── twenty-apps/                       # App examples + internal apps
├── twenty-zapier/                     # Zapier integration (private)
├── twenty-cli/                        # DEPRECATED shim
├── twenty-docs/                       # Documentation site
├── twenty-emails/                     # Email templates
├── twenty-website-new/                # Marketing site
├── twenty-utils/                      # Shared utilities
├── twenty-oxlint-rules/               # Custom lint rules
├── twenty-e2e-testing/                # E2E test harness
└── twenty-companion/                  # Desktop companion app
```
