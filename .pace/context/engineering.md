---
language: typescript
package_manager: yarn
test_runner: jest
test_command: npx nx test <project-name>
test_file_pattern: "**/*.test.ts,**/*.spec.ts,**/*.integration-spec.ts"
require_tests: true
---

# Engineering Context — Twenty CRM

## Module Map

Twenty is an **Nx monorepo** with 18 packages under `packages/`:

### Core Application Packages

- **`twenty-server/`** (TypeScript/NestJS) — Backend GraphQL API, REST API, queue workers, database migrations
  - Entry points: `src/main.ts` (HTTP server), `queue-worker/queue-worker.ts` (BullMQ worker), `command/command.ts` (CLI)
  - Stack: NestJS, TypeORM, GraphQL Yoga, BullMQ, PostgreSQL, Redis, ClickHouse (for analytics)
  - Modules: `src/modules/` (business logic), `src/engine/` (framework-level code), `src/database/` (migrations/seeds)

- **`twenty-front/`** (TypeScript/React) — Frontend SPA built with Vite
  - Entry point: `src/index.tsx`
  - Stack: React 18, Apollo Client, Jotai (state), Linaria (CSS-in-JS), React Router, Vite
  - Modules: `src/modules/` (feature modules), `src/pages/` (routes), `src/generated/` (GraphQL codegen output)

### Shared Libraries

- **`twenty-shared/`** — Shared utilities and types used by server and front
- **`twenty-ui/`** — Design system components (React, Linaria)
- **`twenty-emails/`** — React Email templates for transactional emails
- **`twenty-utils/`** — Common utilities

### SDK & Integrations

- **`twenty-sdk/`** — Node.js SDK for Twenty's REST/GraphQL API (uses `@genql/runtime`)
- **`twenty-client-sdk/`** — Auto-generated client SDK from GraphQL schema
- **`twenty-zapier/`** — Zapier integration app
- **`twenty-apps/`** — Apps/integrations framework

### Developer Experience

- **`twenty-cli/`** — Deprecated CLI (replaced by twenty-sdk)
- **`create-twenty-app/`** — CLI scaffolding tool for new Twenty apps
- **`twenty-docs/`** — Mintlify-based documentation site
- **`twenty-website/`** — Marketing website (Next.js)
- **`twenty-website-new/`** — New marketing site (Next.js + Linaria)

### Testing & Tooling

- **`twenty-e2e-testing/`** — End-to-end tests
- **`twenty-oxlint-rules/`** — Custom oxlint rules
- **`twenty-companion/`** — Meeting recorder desktop app (Electron-based)
- **`twenty-front-component-renderer/`** — Component rendering for plugins

### Infrastructure

- **`twenty-docker/`** — Docker Compose setup and Dockerfiles for self-hosting

## Tech Stack

### Languages & Frameworks
- **TypeScript 5.9.2** (all packages)
- **Node.js 24.5.0** (engine requirement)
- **NestJS 11.x** (backend framework)
- **React 18.x** (frontend framework)
- **GraphQL 16.8.1** (API layer)

### Backend Technologies
- **PostgreSQL 18** (primary database)
- **ClickHouse 25.8.8** (analytics events)
- **Redis** (session storage, caching, BullMQ)
- **TypeORM 0.3.20** (ORM with custom patches)
- **BullMQ 5.x** (job queue)
- **GraphQL Yoga 4.x** (GraphQL server)
- **Passport.js** (authentication: JWT, Google OAuth, Microsoft OAuth, SAML)
- **Sharp** (image processing)
- **Nodemailer** (email sending)
- **ImapFlow** (email sync)
- **AI SDKs**: Anthropic, OpenAI, Google, Mistral, Amazon Bedrock, xAI (for AI features)

### Frontend Technologies
- **Vite 7.x** (build tool)
- **Apollo Client 4.x** (GraphQL client)
- **Jotai 2.x** (state management)
- **Linaria 6.x** (zero-runtime CSS-in-JS)
- **React Router 6.x** (routing)
- **Lingui 5.x** (i18n)
- **TipTap 3.x** (rich text editor)
- **BlockNote** (block-based editor)
- **Monaco Editor** (code editor)
- **React Flow / XY Flow** (node-based UIs)
- **Nivo** (charts)
- **@hello-pangea/dnd** (drag-and-drop)
- **React Hook Form + Zod** (form validation)

### Build & Tooling
- **Nx 22.5.4** (monorepo orchestration)
- **Yarn 4.13.0** (package manager, workspaces)
- **Jest 29.7.0** (unit tests)
- **Vitest 4.x** (Storybook tests)
- **Playwright** (e2e tests)
- **Storybook 10.x** (UI component development)
- **Oxlint 1.51.0** (fast linter)
- **Prettier** (code formatting)
- **SWC** (fast TypeScript compiler)
- **GraphQL Codegen** (auto-generate TypeScript types from GraphQL schema)

### DevOps & Observability
- **Docker** (containerization)
- **Kubernetes / Helm** (orchestration)
- **Sentry** (error tracking, profiling)
- **OpenTelemetry** (metrics, tracing)
- **Chromatic** (visual regression testing)

## System Architecture

### High-Level Flow
```
[Browser] → [twenty-front (Vite SPA)]
              ↓ (Apollo Client / GraphQL)
           [twenty-server (NestJS)]
              ↓
    ┌─────────┼──────────┐
    ↓         ↓          ↓
[PostgreSQL] [Redis]  [ClickHouse]
                ↓
           [BullMQ Worker]
```

### Request Flow
1. **Frontend** (`twenty-front`) sends GraphQL queries/mutations via Apollo Client to `/graphql` or `/metadata`
2. **Server** (`twenty-server`) validates JWT (Passport), resolves GraphQL via GraphQL Yoga
3. **Business Logic** in `src/modules/` (e.g., `crm/`, `messaging/`, `calendar/`) uses TypeORM to query PostgreSQL
4. **Jobs** (email sync, webhooks, workflows) are enqueued to BullMQ (Redis) and processed by workers
5. **Analytics events** are written to ClickHouse for reporting

### Key Components
- **Authentication**: JWT-based (Passport strategies: Google, Microsoft, SAML, local)
- **Multi-tenancy**: Each workspace has isolated PostgreSQL schemas (managed by `WorkspaceMetadataModule`)
- **Custom Object Metadata**: Dynamic GraphQL schema generation based on user-defined objects (like Airtable)
- **Queue Workers**: Separate process (`yarn worker:prod`) handles async jobs (email sync, webhooks)
- **Real-time**: GraphQL subscriptions via `graphql-redis-subscriptions`
- **Migrations**: Database migrations in `packages/twenty-server/src/database/migrations/`; ClickHouse migrations in `packages/twenty-server/src/database/clickHouse/migrations/`

### Deployment Modes
1. **Docker Compose** (self-hosted): PostgreSQL + Redis + Server + Worker in separate containers
2. **All-in-one Dev Image** (`twenty-app-dev`): PostgreSQL + Redis + Server in one container (for SDK/local dev)
3. **Cloud Deploy**: Kubernetes (Helm charts in `packages/twenty-docker/helm/`)

## Key Interfaces & Contracts

### GraphQL APIs
- **Core GraphQL API** (`/graphql`): Query/mutate user data (companies, people, opportunities, tasks, etc.)
- **Metadata GraphQL API** (`/metadata`): Admin API to manage custom objects, fields, relations, views, workflows

### REST API
- **Path**: `/rest/*` 
- **Purpose**: RESTful interface to CRM objects (auto-generated from GraphQL schema)
- **Middleware**: `RestCoreMiddleware` authenticates and hydrates workspace context

### MCP (Model Context Protocol)
- **Path**: `/mcp`
- **Purpose**: Integration with AI assistants (Claude, etc.) to expose Twenty as a context provider

### Environment Variables (Server)
Required secrets (see `.env.example`):
- `PG_DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `APP_SECRET` — Session signing secret
- `SERVER_URL` — Public server URL
- `STORAGE_TYPE` — `local` or `s3`
- OAuth: `AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET`, etc.

### Frontend Config Injection
- Server generates `window._env_` JavaScript runtime config at build time (`/utils/generate-front-config`)
- Allows frontend to use backend-controlled `SERVER_URL` without rebuild

## Coding Conventions

### Directory Structure
- **Backend modules**: `packages/twenty-server/src/modules/<domain>/<entity>/<entity>.service.ts`
- **Frontend modules**: `packages/twenty-front/src/modules/<feature>/components/<Component>.tsx`
- **Tests**: Co-located with source files (`.spec.ts` for unit, `.integration-spec.ts` for integration)

### Naming
- **Services**: `PascalCase` with `Service` suffix (e.g., `CompanyService`)
- **Components**: `PascalCase` (e.g., `CompanyCard.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useCreateCompany`)
- **GraphQL**: Operations in `PascalCase` (e.g., `CreateCompanyMutation`)

### Error Handling
- **Backend**: Throw NestJS exceptions (`NotFoundException`, `BadRequestException`, etc.)
- **Frontend**: Use `react-error-boundary` for component-level error boundaries

### State Management (Frontend)
- **Global state**: Jotai atoms in `src/modules/<feature>/states/`
- **Server state**: Apollo Client cache (normalized by `id`)
- **Forms**: React Hook Form + Zod schemas

### GraphQL Patterns
- **Codegen**: Run `npx nx run twenty-front:graphql:generate` after schema changes
- **Fragments**: Define reusable fragments in `<Feature>Fragment.ts`
- **Optimistic Updates**: Use Apollo `optimisticResponse` for mutations

### Internationalization
- **Lingui**: Extract messages with `npx nx run <project>:lingui:extract`, compile with `:lingui:compile`
- **Message IDs**: Use descriptive IDs (e.g., `crm.company.create.success`)

### Performance
- **Backend**: Use `@CacheTTL()` decorator for cached queries
- **Frontend**: Use `React.memo()` for expensive components, `useDeferredValue` for non-critical updates

## Test Patterns

### Backend Tests
- **Unit tests** (`.spec.ts`): Test services/resolvers in isolation with mocked dependencies
  - Run: `npx nx test twenty-server`
  - Config: `packages/twenty-server/jest.config.mjs`
  
- **Integration tests** (`.integration-spec.ts`): Test against real PostgreSQL/Redis/ClickHouse
  - Run: `npx nx test:integration twenty-server`
  - Config: `packages/twenty-server/jest-integration.config.ts`
  - Setup: `setupTests.ts` (creates test DB, runs migrations)
  - Services: PostgreSQL 18, Redis, ClickHouse (via GitHub Actions)

### Frontend Tests
- **Unit tests** (`.test.ts`, `.test.tsx`): Test components/hooks with `@testing-library/react`
  - Run: `npx nx test twenty-front`
  - Config: `packages/twenty-front/jest.config.mjs`
  
- **Storybook tests**: Visual regression tests via Playwright + Vitest
  - Run: `npx nx storybook:test twenty-front`
  - Config: `packages/twenty-front/vitest.config.ts`
  - Sharded across 4 workers in CI

### E2E Tests
- **Package**: `twenty-e2e-testing`
- **Tool**: Playwright
- **Coverage**: Critical user flows (signup, create company, workflows)

### CI Test Execution
- **Front**: 3 scopes (modules, pages, performance) × 4 shards = 12 parallel Storybook test jobs
- **Server**: 10 parallel integration test shards
- **Coverage**: `@nx/jest` with Istanbul (text-summary in CI, lcov locally)

### Test Data
- **Faker.js**: Generate realistic test data (`@faker-js/faker`)
- **Factories**: Defined in `test/factories/` (server), `__mocks__/` (front)
- **Fixtures**: Seed data in `packages/twenty-server/src/database/seeds/`

### Mocking
- **MSW**: Mock HTTP/GraphQL requests in Storybook (`msw-storybook-addon`)
- **Jest mocks**: `jest.mock()` for Node modules
- **Test doubles**: Use NestJS `@nestjs/testing` utilities for DI

### Assertions
- **Jest**: `expect(value).toBe()`, `expect(value).toMatchObject()`
- **Testing Library**: `screen.getByRole()`, `expect(element).toBeInTheDocument()`
- **Playwright**: `await expect(page).toHaveURL()`

### Pre-commit Checks
- **Lint**: `npx nx lint <project>` (oxlint + prettier)
- **Typecheck**: `npx nx typecheck <project>` (tsgo)
- **Test**: `npx nx test <project>` (affected projects only)

### CI Validation (GitHub Actions)
- **ci-front.yaml**: Lint, typecheck, test, build, Storybook tests (sharded)
- **ci-server.yaml**: Lint, typecheck, test, integration tests (sharded), migration/codegen checks
- **ci-test-docker-compose.yaml**: Validates Docker Compose setup boots successfully
