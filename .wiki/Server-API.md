# Server API

Twenty server (NestJS) exposes four API surfaces. All require authentication (API key or OAuth bearer token) unless noted.

## Surface Overview

| Surface | Endpoint Prefix | Purpose |
|---|---|---|
| Core GraphQL | `/graphql` | Workspace data CRUD, workspace management, auth, billing, workflows, AI, search, events |
| Metadata GraphQL | `/metadata` | Schema introspection, app lifecycle, logic functions, connections, views, roles, skills, agents |
| REST API | `/rest/{objectPlural}` | CRUD via REST on standard and custom objects |
| MCP | `/mcp` | Model Context Protocol for AI agent tool use |
| App-specific | Various | App billing, connections, OAuth, public assets |

## Core GraphQL (`/graphql`)

Dynamic schema generated per-workspace from object/field metadata. Resolvers built at runtime.

**Operation families** (from resolver builder factories):

| Family | Operations |
|---|---|
| CRUD | `createOne`, `createMany`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`, `destroyOne`, `destroyMany`, `restoreOne`, `restoreMany`, `mergeMany` |
| Query | `findOne`, `findMany`, `findDuplicates`, `groupBy` |
| Pagination | Cursor-based (`startingAfter`, `endingBefore`), offset (`limit`) |

**Core resolvers** (from `engine/core-modules/`):

| Resolver | Domain |
|---|---|
| `auth.resolver` | Login, signup, token refresh |
| `workspace.resolver` | Workspace CRUD, current workspace |
| `user.resolver` | User profile, preferences |
| `billing.resolver` | Subscription, billing management |
| `workflow-builder.resolver` | Workflow CRUD, triggers, steps, edges |
| `workflow-trigger.resolver` | Trigger activation/deactivation |
| `search.resolver` | Cross-object search |
| `event-logs.resolver` | Audit log queries |
| `agent-chat.resolver` | AI agent conversations |
| `agent-chat-subscription.resolver` | Streaming AI responses |
| `agent.resolver` | AI agent CRUD |
| `dashboard.resolver` | Dashboard + charts |
| `timeline-messaging.resolver` | Message threads |
| `timeline-calendar-event.resolver` | Calendar events |
| `file*.resolver` | File upload/attach across contexts |
| `api-key.resolver` | API key management |
| `sso.resolver` | SSO configuration |
| `enterprise.resolver` | Enterprise features |
| `audit.resolver` | Audit trails |
| `onboarding.resolver` | Onboarding flow |
| `email-verification.resolver` | Email verification |
| `open-api.controller` | OpenAPI schema generation |
| `health.controller` | `/healthz` health check |

## Metadata GraphQL (`/metadata`)

Schema and app lifecycle operations. Used by CLI API wrappers and client SDK.

**App lifecycle resolvers** (from `engine/core-modules/application/`):

| Resolver | Operations |
|---|---|
| `application-registration.resolver` | Register/update app, rotate client secret |
| `application-manifest.resolver` | Sync application manifest |
| `application-install.resolver` | Install/uninstall app |
| `application-development.resolver` | Create development application |
| `application-marketplace/marketplace.resolver` | Marketplace catalog sync, browse, install |
| `application-oauth/*.resolver` | OAuth discovery, registration, token exchange |
| `connection-provider-oauth.controller` | App OAuth callback handling |
| `application-connections.controller` | Connection list/get endpoints |
| `application-upgrade.resolver` | App version upgrade |
| `application-variable.resolver` | App variable management |

**Metadata resolvers** (from `engine/metadata-modules/`):

| Resolver | Domain |
|---|---|
| `object-metadata.resolver` | Object definitions |
| `field-metadata.resolver` | Field definitions |
| `view.resolver` | Views |
| `view-field.resolver` | View field placement |
| `view-filter.resolver` / `view-filter-group.resolver` | View filters |
| `view-sort.resolver` | View sorting |
| `view-group.resolver` | View grouping |
| `page-layout.resolver` / `page-layout-tab.resolver` | Page layouts |
| `navigation-menu-item.resolver` | Navigation structure |
| `command-menu-item.resolver` | Command menu |
| `role.resolver` | Roles and permissions |
| `logic-function.resolver` | Logic function CRUD |
| `front-component.resolver` | Front component management |
| `skill.resolver` | AI skill definitions |
| `index-metadata.resolver` | Metadata indexing |
| `minimal-metadata.resolver` | Lightweight metadata queries |
| `connected-account.resolver` | External account connections |
| `message-channel.resolver` / `message-folder.resolver` | Messaging |
| `calendar-channel.resolver` | Calendar sync |
| `webhook.resolver` / `webhook.controller` | Webhook management |
| `route-trigger.controller` | Route-trigger execution |
| `ai-generate-text.controller` | AI text generation |
| `agent-turn.resolver` | Agent execution monitoring |

## REST API (`/rest/...`)

RESTful CRUD on workspace objects. Mapped from object metadata dynamically.

| Method | Pattern | Purpose |
|---|---|---|
| GET | `/rest/{objectPlural}` | List records (filter, sort, paginate, depth, group-by) |
| GET | `/rest/{objectPlural}/{id}` | Get one record |
| POST | `/rest/{objectPlural}` | Create record(s) |
| PATCH | `/rest/{objectPlural}/{id}` | Update record |
| DELETE | `/rest/{objectPlural}/{id}` | Soft delete |
| POST | `/rest/{objectPlural}/{id}/destroy` | Hard delete |

Query parameters: `limit`, `order_by`, `filter`, `depth`, `group_by`, `starting_after`, `ending_before`, `omit_null_values`, `include_records_sample`, `aggregate_fields`, `view_id`, `soft_delete`.

## MCP Endpoint (`/mcp`)

Model Context Protocol controller at `engine/api/mcp/controllers/mcp-core.controller.ts`. Enables AI agent tool use against Twenty data.

## App-Specific Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/app/billing/charge` | POST | Record credit usage (called by `twenty-sdk/billing`) |
| `/apps/connections/list` | POST | List app connections (called by `twenty-sdk/logic-function`) |
| `/apps/connections/get` | POST | Get connection with fresh token |
| `/oauth/token` | POST | OAuth token exchange |
| `/oauth/register` | POST | Dynamic OAuth client registration |
| `/oauth/discovery` | GET | OAuth server metadata |
| `/public-assets/{workspaceId}/{appId}/{path}` | GET | App public assets |

## OpenAPI

`/open-api` controller generates OpenAPI schema from current workspace metadata. Used for API compatibility checking in CI.
