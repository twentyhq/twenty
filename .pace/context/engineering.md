# Engineering Context - Twenty CRM

## Module Map

### Monorepo Structure (Nx Workspace)
```
packages/
├── twenty-front/                   # TypeScript/React - Frontend application (Vite build)
├── twenty-server/                  # TypeScript/NestJS - Backend API server
├── twenty-ui/                      # TypeScript/React - Shared UI component library
├── twenty-shared/                  # TypeScript - Common types and utilities (must build first)
├── twenty-emails/                  # TypeScript/React - Email templates (React Email)
├── twenty-front-component-renderer/# TypeScript/React - Component renderer for extensions
├── twenty-client-sdk/              # TypeScript - SDK client library with metadata generation
├── twenty-sdk/                     # TypeScript - Developer SDK (replaces twenty-cli)
├── twenty-zapier/                  # TypeScript - Zapier integration
├── twenty-website/                 # TypeScript/Next.js - Documentation site (Keystatic CMS)
├── twenty-website-new/             # TypeScript/Next.js - New marketing website
├── twenty-docs/                    # TypeScript - Docs site (Mintlify)
├── twenty-e2e-testing/             # TypeScript/Playwright - E2E tests
├── twenty-apps/                    # TypeScript - Internal app integrations
├── twenty-desktop/                 # TypeScript/Electron - Desktop meeting recorder
├── twenty-companion/               # TypeScript - Browser companion
├── twenty-oxlint-rules/            # TypeScript - Custom linting rules
└── create-twenty-app/              # TypeScript - CLI scaffolding tool
```

### Root Configuration
- `nx.json` — Nx workspace configuration, task definitions, cache settings, named inputs
- `package.json` — Root dependencies, workspace definitions, prettier config, scripts
- `tsconfig.base.json` — Shared TypeScript config (ES2018, ESNext modules, decorators enabled)
- `.yarnrc.yml`, `yarn.config.cjs` — Yarn 4 berry configuration
- `jest.preset.js` — Shared Jest configuration

## Tech Stack

### Frontend (twenty-front)
- **Framework**: React 18.2 with TypeScript 5.9.2
- **State Management**: Jotai 2.17.1 (atoms, selectors, atom families)
- **Styling**: Linaria 6.2.0 (zero-runtime CSS-in-JS), @radix-ui/colors 3.0.0
- **Build Tool**: Vite 7.0.0 with @vitejs/plugin-react-swc 4.2.3
- **GraphQL Client**: @apollo/client 4.0.0 with code-generation (@graphql-codegen)
- **UI Libraries**: 
  - @floating-ui/react 0.24.3 (popovers, tooltips)
  - @hello-pangea/dnd 16.2.0 (drag-drop)
  - @tabler/icons-react 3.31.0 (icons)
  - @tiptap (rich text editor)
  - @blocknote (block editor)
  - @xyflow/react 12.4.2 (workflow diagrams)
  - react-data-grid 7.0.0-beta (table views)
  - @nivo/* (charts)
- **Routing**: react-router-dom 6.30.3
- **Forms**: react-hook-form 7.45.1 with @hookform/resolvers 5.2.2
- **Internationalization**: @lingui/react 5.1.2
- **Testing**: Jest 29.7.0, @testing-library/react 16.3.0, Playwright 1.56.1
- **Error Tracking**: @sentry/react 10.27.0

### Backend (twenty-server)
- **Framework**: NestJS 11.1.16 (Node 24.5.0)
- **Language**: TypeScript 5.9.2
- **ORM**: TypeORM 0.3.20 (patched) with PostgreSQL 18
- **GraphQL**: graphql-yoga 4.0.5 with @graphql-yoga/nestjs 2.1.0, @nestjs/graphql 12.1.1
- **Database**: PostgreSQL 18 (primary), Redis 5.6.0 (cache/sessions), ClickHouse 25.8.8 (analytics)
- **Job Queue**: BullMQ 5.40.0
- **Authentication**: passport 0.7.0, @nestjs/jwt 11.0.1, bcrypt 5.1.1, otplib 12.0.1
- **Email**: nodemailer 8.0.4, @react-email/render 1.2.3
- **File Storage**: @aws-sdk/client-s3 3.1001.0, sharp 0.32.6
- **AI Integration**: ai 6.0.97, @ai-sdk/* (OpenAI, Anthropic, Google, Mistral, xAI, Bedrock)
- **Observability**: @sentry/nestjs 10.27.0, @opentelemetry/* (metrics, tracing)
- **CLI**: nest-commander 3.19.1
- **Testing**: Jest 29.7.0, supertest 6.1.3
- **Build**: @swc/core 1.15.11, esbuild 0.25.10

### Monorepo Tooling
- **Build System**: Nx 22.5.4 (with affected commands, caching, distributed task execution)
- **Package Manager**: Yarn 4.13.0 (berry with PnP)
- **Testing**: Jest 29.7.0, Vitest 4.0.18, Playwright 1.56.1
- **Linting**: Oxlint 1.51.0 (custom rules in twenty-oxlint-rules), Prettier 3.1.1
- **Type Checking**: TypeScript 5.9.2, tsgo (TypeScript native preview)
- **Storybook**: 10.3.3 with Chromatic integration
- **CI/CD**: GitHub Actions with Nx cloud caching

## System Architecture

### Multi-Tenant SaaS Architecture
- **Workspace Isolation**: PostgreSQL schema-per-workspace model
- **Core Schema**: System-wide tables (users, workspaces, billing, feature flags)
- **Metadata Schema**: Object/field definitions, permissions, workflows
- **Workspace Schemas**: Per-tenant data (dynamically created, prefix: `workspace_`)
- **State Machine**: Workspaces have states (active, suspended, deleted)

### Frontend Architecture
- **Route-based code splitting**: Vite dynamic imports
- **State layers**:
  - Local component state (useState, useReducer)
  - Global state (Jotai atoms, atom families for collections)
  - Server cache (Apollo Client normalized cache)
- **Feature modules**: `packages/twenty-front/src/modules/` organized by domain
- **Component hierarchy**: UI components (twenty-ui) → Feature components → Pages
- **Build**: Vite bundles with rollup, runtime env injection via shell script

### Backend Architecture
- **NestJS Modules**: Feature-based organization (auth, user, workspace, object-metadata, etc.)
- **GraphQL API**: Code-first schema generation with decorators, DataLoader for N+1 prevention
- **Job Processing**: BullMQ workers (email sync, calendar sync, data migrations)
- **Database Commands**: 
  - **Instance commands** (fast/slow) — schema and data migrations at instance level
  - **Workspace commands** — iterate over all active/suspended workspaces
  - Auto-registration via decorators (@RegisteredInstanceCommand, @RegisteredWorkspaceCommand)
- **Caching**: Redis for sessions, query results, rate limiting
- **File uploads**: S3-compatible storage (AWS, local filesystem)
- **Authentication**: JWT (access/refresh tokens), OAuth2 (Google, Microsoft), SAML, password

### Database Schema Management
- **Upgrade Commands** replace raw TypeORM migrations:
  - Generate with `npx nx run twenty-server:database:migrate:generate --name <name> --type <fast|slow>`
  - Fast commands: immediate schema changes (extend `FastInstanceCommand`)
  - Slow commands: long-running data backfills (add `runDataMigration` method)
  - Execution order: fast → slow (with `--include-slow`) → workspace commands
- **Never edit committed command up/down logic** unless on pre-release branch
- **Entity changes trigger instance command generation** — use decorators for discovery

### Communication Patterns
- **Frontend → Backend**: GraphQL over HTTP (queries, mutations), GraphQL subscriptions (WebSocket)
- **Backend → Queue**: BullMQ Redis-backed jobs
- **Backend → Database**: TypeORM query builder, raw SQL for complex queries
- **Backend → External APIs**: Axios with retry logic (googleapis, Microsoft Graph, Stripe)

## Key Interfaces & Contracts

### GraphQL Schema
- **Auto-generated**: Frontend types generated from schema via @graphql-codegen
- **Commands**: 
  - `npx nx run twenty-front:graphql:generate` (data schema)
  - `npx nx run twenty-front:graphql:generate --configuration=metadata` (metadata schema)
- **Breaking change detection**: CI validates no committed migrations pending, no uncommitted schema changes
- **Location**: `packages/twenty-front/src/generated/` (data), `packages/twenty-front/src/generated-metadata/` (metadata)

### REST API
- **OpenAPI spec**: Generated via Scalar (@scalar/api-reference-react)
- **Endpoints**: `/rest/metadata/*`, `/rest/*` (GraphQL fallback)

### CLI (twenty-server commands)
```bash
# Production commands
node dist/command/command run-instance-commands [--include-slow]
node dist/command/command <workspace-command> [--dry-run] [--verbose]

# Development commands
npx nx database:reset twenty-server
npx nx run twenty-server:database:migrate:generate --name <name> --type <fast|slow>
npx nx clickhouse:migrate twenty-server
npx nx clickhouse:seed twenty-server
```

### Environment Variables
**Required**:
- `NODE_ENV` (development|production|test)
- `PG_DATABASE_URL` (postgres://user:pass@host:port/db)
- `REDIS_URL` (redis://host:port)
- `APP_SECRET` (random string for encryption)
- `FRONTEND_URL` (CORS origin)

**Optional** (100+ config vars, see `.env.example`):
- Authentication: `AUTH_GOOGLE_*`, `AUTH_MICROSOFT_*`, `AUTH_PASSWORD_ENABLED`
- Storage: `STORAGE_TYPE`, `STORAGE_LOCAL_PATH`, `AWS_*`
- AI: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_PROVIDERS`, `AI_MODEL_PREFERENCES`
- Email: `EMAIL_DRIVER`, `EMAIL_SMTP_*`
- Observability: `SENTRY_DSN`, `ANALYTICS_ENABLED`, `CLICKHOUSE_URL`
- Billing: `IS_BILLING_ENABLED`, `BILLING_STRIPE_*`

### Package-to-Package Dependencies
- **twenty-shared must build first** — all other packages depend on it
- **Build order**: twenty-shared → twenty-emails → twenty-server
- **Frontend imports**: twenty-ui, twenty-shared, twenty-front-component-renderer
- **No circular dependencies** enforced by Nx dependency graph

## Coding Conventions

### TypeScript Standards
- **Strict mode enabled**: no `any`, no implicit any, strict null checks
- **Types over interfaces** (except when extending third-party)
- **String literals over enums** (except GraphQL enums)
- **Named exports only** — no default exports
- **Functional components only** — no class components
- **Generic naming**: Use descriptive names (`TData` not `T`)

### Naming Conventions
- **Variables/functions**: camelCase (`userAccountBalance`, `calculateTotal`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`, `MAX_RETRIES`)
- **Types/Classes**: PascalCase (`UserService`, `ButtonProps` with `Props` suffix)
- **Files/directories**: kebab-case (`user-profile.component.tsx`)
- **No abbreviations**: `user` not `u`, `fieldMetadata` not `fm`

### File Suffixes
- `.component.tsx` — React components
- `.service.ts` — NestJS services
- `.entity.ts` — TypeORM entities
- `.dto.ts` — Data transfer objects
- `.module.ts` — NestJS modules
- `.test.ts` / `.spec.ts` — Tests (frontend `.test.ts`, backend `.spec.ts`)
- `.integration-spec.ts` — Integration tests

### Import Order
1. External libraries (`react`, `@nestjs/common`)
2. Internal absolute imports (`@/components`, workspace packages)
3. Relative imports (`./types`, `../utils`)

### Comment Style
- Use `//` for all comments (no JSDoc `/** */` blocks)
- Comment WHY (business logic), not WHAT (code behavior)
- Multi-line comments use multiple `//` lines
- No obvious comments (e.g., "Get all users" above `const users = getUsers()`)
- Add TODOs for future work

### State Management Patterns
- **Jotai atoms**: Primitive state (`atom()`)
- **Jotai selectors**: Derived state (read-only atoms)
- **Jotai atom families**: Dynamic collections (keyed by ID)
- **Functional updates**: `setState(prev => prev + 1)`
- **Event handlers over useEffect** for state changes

### Error Handling
- Custom error classes with meaningful messages
- Structured logging with context (userId, workspaceId)
- Errors propagate to Sentry in production
- Backend: NestJS exception filters, frontend: React error boundaries

## Test Patterns

### Test Structure (AAA)
```typescript
describe('Feature', () => {
  describe('when condition', () => {
    it('should behavior', () => {
      // Arrange — setup
      // Act — execute
      // Assert — verify
    });
  });
});
```

### Running Tests
```bash
# PREFERRED: Single test file (fast)
npx jest path/to/test.test.ts --config=packages/PROJECT/jest.config.mjs

# Examples
npx jest packages/twenty-front/src/utils/file.test.ts --config=packages/twenty-front/jest.config.mjs
npx jest packages/twenty-server/src/services/user.spec.ts --config=packages/twenty-server/jest.config.mjs

# Full project tests (slower)
npx nx test twenty-front
npx nx test twenty-server

# Integration tests (server)
npx nx run twenty-server:test:integration:with-db-reset

# E2E tests
npx nx test twenty-e2e-testing

# Storybook tests (sharded)
npx nx storybook:test twenty-front --configuration=modules --shard=1/4
```

### Test Pyramid
- **70% unit tests** — isolated component/service logic
- **20% integration tests** — API endpoints, database interactions
- **10% E2E tests** — full user flows (Playwright)

### Frontend Testing
- **@testing-library/react**: Query by user-visible elements (text, role, label)
- **@testing-library/user-event**: Realistic user interactions
- **MSW (Mock Service Worker)**: Mock GraphQL/REST APIs
- **Storybook tests**: Component visual/interaction testing with Vitest

### Backend Testing
- **Jest**: Unit tests for services, resolvers
- **Supertest**: Integration tests for HTTP endpoints
- **Test databases**: Separate `test` database, reset between runs
- **Mocks**: Jest mocks for external services (email, S3, Redis)

### Test Data
- Use factory functions (`createTestUser(overrides)`)
- Faker.js for realistic test data
- Clear mocks between tests (`jest.clearAllMocks()` in `beforeEach`)

### Coverage Requirements
- Storybook tests generate coverage reports (nyc)
- Integration tests run with coverage enabled in CI
- Coverage thresholds enforced per package
