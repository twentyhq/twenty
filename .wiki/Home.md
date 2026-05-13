# Twenty Platform Surface Map

Source-grounded canonical inventory of every API, CLI, MCP, SDK, app-scaffolding, and CI/CD surface in the Twenty CRM monorepo. Evidence traced to repository files. No inference from package names alone.

## Navigation

| Document | Surfaces Covered |
|---|---|
| [[SDK-Exports]] | `twenty-sdk/define`, `/front-component`, `/logic-function`, `/billing`, `/ui`, `/cli`, `/front-component-renderer` |
| [[CLI-Commands]] | All `twenty` CLI commands: dev, build, deploy, install, publish, add, exec, logs, typecheck, uninstall, remote, server |
| [[Create-Twenty-App]] | Scaffolder CLI, template structure, example download, generated CI/CD workflows |
| [[Server-API]] | REST API, Core GraphQL, Metadata GraphQL, MCP endpoint, App lifecycle endpoints, OpenAPI |
| [[GitHub-Actions]] | 37 workflows + 8 composite actions grouped by automation family |
| [[Packages]] | MCP config, twenty-client-sdk, front-component-renderer, Zapier, twenty-cli (deprecated), workspace map |
| [[Automation-Opportunities]] | High-signal combinations, template gaps, app-that-makes-apps paths |

## Package Map

| Package | Role | Status |
|---|---|---|
| `twenty-sdk` | App SDK (define primitives + CLI binary `twenty`) | Active, v2.3.0 |
| `create-twenty-app` | App scaffolder CLI | Active, v2.3.0 |
| `twenty-client-sdk` | Generated GraphQL clients (core, metadata, generate) | Active |
| `twenty-server` | NestJS backend (REST, GraphQL, MCP, app lifecycle) | Active |
| `twenty-front` | React SPA | Active |
| `twenty-front-component-renderer` | Remote-dom worker for app UI extensions | Active (private) |
| `twenty-shared` | Cross-package types, constants, metadata enums | Active |
| `twenty-ui` | Shared component library | Active |
| `twenty-zapier` | Zapier Platform integration | Active (private) |
| `twenty-cli` | Legacy CLI shim | Deprecated, routes to twenty-sdk |
| `twenty-apps` | App examples (hello-world, postcard, internal/xopure-crm) | Active |
| `twenty-docs` | Documentation site | Active |
| `twenty-emails` | Email templates | Active |
| `twenty-companion` | Desktop companion app | Active |
| `twenty-website-new` | Marketing website | Active |
| `twenty-utils` | Shared utilities | Active |
| `twenty-oxlint-rules` | Custom lint rules | Active |
| `twenty-e2e-testing` | E2E test harness | Active |

## Key Entry Points

- **Create an app**: `npx create-twenty-app@latest my-app --skip-local-instance`
- **Develop locally**: `yarn twenty dev`
- **Build**: `yarn twenty build --tarball`
- **Deploy to registry**: `yarn twenty deploy --remote <name>`
- **Install on workspace**: `yarn twenty install --remote <name>`
- **Add entity**: `yarn twenty add <entityType> --path <path>`
- **Server GraphQL**: `/graphql` (core workspace data)
- **Metadata GraphQL**: `/metadata` (schema, apps, logic functions, connections)
- **REST API**: `/rest/{objectPlural}` (CRUD via REST)
- **MCP endpoint**: `/mcp` (Model Context Protocol)
- **App billing**: `/app/billing/charge`
- **App connections**: `/apps/connections/list`, `/apps/connections/get`

## Environment Requirements

- Node `^24.5.0`, Yarn `^4.0.2`
- Engine: `yarn@4.13.0`
- License: AGPL-3.0
