# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twenty is an open-source CRM built with modern technologies in a monorepo structure. The codebase is organized as an Nx workspace with multiple packages.

## Key Commands

### Development
```bash
# Start development environment (frontend + backend + worker)
yarn start

# Individual package development
npx nx start twenty-front     # Start frontend dev server
npx nx start twenty-server    # Start backend server
npx nx run twenty-server:worker  # Start background worker
```

### Testing
```bash
# Preferred: run a single test file (fast)
npx jest path/to/test.test.ts --config=packages/PROJECT/jest.config.mjs

# Run all tests for a package
npx nx test twenty-front      # Frontend unit tests
npx nx test twenty-server     # Backend unit tests
npx nx run twenty-server:test:integration:with-db-reset  # Integration tests with DB reset
# To run an indivual test or a pattern of tests, use the following command:
cd packages/{workspace} && npx jest "pattern or filename"

# Storybook
npx nx storybook:build twenty-front
npx nx storybook:test twenty-front

# When testing the UI end to end, click on "Continue with Email" and use the prefilled credentials.
```

### Code Quality
```bash
# Linting (diff with main - fastest, always prefer this)
npx nx lint:diff-with-main twenty-front
npx nx lint:diff-with-main twenty-server
npx nx lint:diff-with-main twenty-front --configuration=fix  # Auto-fix

# Linting (full project - slower, use only when needed)
npx nx lint twenty-front
npx nx lint twenty-server

# Type checking
npx nx typecheck twenty-front
npx nx typecheck twenty-server

# Format code
npx nx fmt twenty-front
npx nx fmt twenty-server
```

### Build
```bash
# Build packages (twenty-shared must be built first)
npx nx build twenty-shared
npx nx build twenty-front
npx nx build twenty-server
```

### Database Operations
```bash
# Database management
npx nx database:reset twenty-server         # Reset database
npx nx run twenty-server:database:init:prod # Initialize database
npx nx run twenty-server:database:migrate:prod # Run migrations

# Generate migration (replace [name] with kebab-case descriptive name)
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/common/[name] -d src/database/typeorm/core/core.datasource.ts

# Sync metadata
npx nx run twenty-server:command workspace:sync-metadata
```

### Database Inspection (Postgres MCP)

A read-only Postgres MCP server is configured in `.mcp.json`. Use it to:
- Inspect workspace data, metadata, and object definitions while developing
- Verify migration results (columns, types, constraints) after running migrations
- Explore the multi-tenant schema structure (core, metadata, workspace-specific schemas)
- Debug issues by querying raw data to confirm whether a bug is frontend, backend, or data-level
- Inspect metadata tables to debug GraphQL schema generation or `workspace:sync-metadata` issues

This server is read-only — for write operations (reset, migrations, sync), use the CLI commands above.

### GraphQL
```bash
# Generate GraphQL types (run after schema changes)
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Jotai (state management), Linaria (styling), Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL (with GraphQL Yoga)
- **Monorepo**: Nx workspace managed with Yarn 4

### Package Structure
```
packages/
├── twenty-front/          # React frontend application
├── twenty-server/         # NestJS backend API
├── twenty-ui/             # Shared UI components library
├── twenty-shared/         # Common types and utilities
├── twenty-emails/         # Email templates with React Email
├── twenty-website/        # Next.js documentation website
├── twenty-zapier/         # Zapier integration
└── twenty-e2e-testing/    # Playwright E2E tests
```

### Key Development Principles
- **Functional components only** (no class components)
- **Named exports only** (no default exports)
- **Types over interfaces** (except when extending third-party interfaces)
- **String literals over enums** (except for GraphQL enums)
- **No 'any' type allowed** — strict TypeScript enforced
- **Event handlers preferred over useEffect** for state updates
- **Props down, events up** — unidirectional data flow
- **Composition over inheritance**
- **No abbreviations** in variable names (`user` not `u`, `fieldMetadata` not `fm`)

### Naming Conventions
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/Classes**: PascalCase (suffix component props with `Props`, e.g. `ButtonProps`)
- **Files/directories**: kebab-case with descriptive suffixes (`.component.tsx`, `.service.ts`, `.entity.ts`, `.dto.ts`, `.module.ts`)
- **TypeScript generics**: descriptive names (`TData` not `T`)

### File Structure
- Components under 300 lines, services under 500 lines
- Components in their own directories with tests and stories
- Use `index.ts` barrel exports for clean imports
- Import order: external libraries first, then internal (`@/`), then relative

### Comments
- Use short-form comments (`//`), not JSDoc blocks
- Explain WHY (business logic), not WHAT
- Do not comment obvious code
- Multi-line comments use multiple `//` lines, not `/** */`

### State Management
- **Jotai** for global state: atoms for primitive state, selectors for derived state, atom families for dynamic collections
- Component-specific state with React hooks (`useState`, `useReducer` for complex logic)
- GraphQL cache managed by Apollo Client
- Use functional state updates: `setState(prev => prev + 1)`

### Backend Architecture
- **NestJS modules** for feature organization
- **TypeORM** for database ORM with PostgreSQL
- **GraphQL** API with code-first approach
- **Redis** for caching and session management
- **BullMQ** for background job processing

### Database & Migrations
- **PostgreSQL** as primary database
- **Redis** for caching and sessions
- **ClickHouse** for analytics (when enabled)
- Always generate migrations when changing entity files
- Migration names must be kebab-case (e.g. `add-agent-turn-evaluation`)
- Include both `up` and `down` logic in migrations
- Never delete or rewrite committed migrations

### Utility Helpers
Use existing helpers from `twenty-shared` instead of manual type guards:
- `isDefined()`, `isNonEmptyString()`, `isNonEmptyArray()`

## Development Workflow

IMPORTANT: Use Context7 for code generation, setup or configuration steps, or library/API documentation. Automatically use the Context7 MCP tools to resolve library IDs and get library docs without waiting for explicit requests.

### Before Making Changes
1. Always run linting (`lint:diff-with-main`) and type checking after code changes
2. Test changes with relevant test suites (prefer single-file test runs)
3. Ensure database migrations are generated for entity changes
4. Check that GraphQL schema changes are backward compatible
5. Run `graphql:generate` after any GraphQL schema changes

### Code Style Notes
- Use **Linaria** for styling with zero-runtime CSS-in-JS (styled-components pattern)
- Follow **Nx** workspace conventions for imports
- Use **Lingui** for internationalization
- Apply security first, then formatting (sanitize before format)

### Testing Strategy
- **Test behavior, not implementation** — focus on user perspective
- **Test pyramid**: 70% unit, 20% integration, 10% E2E
- Query by user-visible elements (text, roles, labels) over test IDs
- Use `@testing-library/user-event` for realistic interactions
- Descriptive test names: "should [behavior] when [condition]"
- Clear mocks between tests with `jest.clearAllMocks()`

## Dev Environment Setup

All dev environments (Claude Code web, Cursor, local) use one script:

```bash
bash packages/twenty-utils/setup-dev-env.sh
```

This handles everything: starts Postgres + Redis (auto-detects local services vs Docker), creates databases, and copies `.env` files. Idempotent — safe to run multiple times.

- `--docker` — force Docker mode (uses `packages/twenty-docker/docker-compose.dev.yml`)
- `--down` — stop services
- `--reset` — wipe data and restart fresh
- **Skip the setup script** for tasks that only read code — architecture questions, code review, documentation, etc.

**Note:** CI workflows (GitHub Actions) manage services via Actions service containers and run setup steps individually — they don't use this script.

## Important Files
- `nx.json` - Nx workspace configuration with task definitions
- `tsconfig.base.json` - Base TypeScript configuration
- `package.json` - Root package with workspace definitions
- `.cursor/rules/` - Detailed development guidelines and best practices

## CCG Central — Enterprise Modules (Fork)

This fork extends Twenty CRM with 33 enterprise modules for a multi-tenant SaaS platform targeting LATAM markets. All modules are pure expansion — zero core modifications.

### Architecture

- **33 NestJS modules** registered in `core-engine.module.ts`
- **0 cross-module dependencies** — each module extractable to microservice
- **workspaceId on every entity** — multi-tenant via RLS
- **Feature flags** for module activation per workspace (`FeatureFlagKey.ts`)
- **Event bus bridge** via `SaaSPlatformService.emitEvent()`
- **175 TypeScript files, 0 compilation errors**

### Enterprise Module Map

```
engine/core-modules/
├── sales-execution/        # Quotas, territories, deal blueprints
├── customer-success/       # Health score, NPS, playbooks, QBR
├── cpq/                    # Price books, quotes, line items
├── abm/                    # Target accounts, ABM campaigns
├── omnicanal/              # Sequences, WhatsApp, SMS, unified inbox, chat widget
├── ai-ml/                  # Lead scoring, sentiment, NLP, NBA, enrichment
├── bi-analytics/           # Dashboard widgets, real SQL queries
├── ai-agents/              # SDR, CSM, Deal Qual, Meeting Notes, CI, Contract
├── accounts-receivable/    # Invoicing, payments, dunning, disputes, portal
├── it-asset-management/    # Assets, licenses, depreciation, ITSM
├── trade-import/           # POs, shipments, customs, landed cost, OCR, carbon
├── accounting-integration/ # ERP sync, tax rules, revenue recognition, commissions
├── fintech/                # Embedded payments, e-invoicing DIAN/SAT, partners
├── hrm/                    # Employees, recruitment, payroll CO, performance, leaves
├── contract-lifecycle/     # CLM, redlining, signatures, risk scoring
├── field-service/          # Work orders, technicians, dispatch, service contracts
├── procurement/            # Purchase requests, RFQ, vendor scorecards
├── event-management/       # Events, registrations, QR check-in, ROI
├── lms/                    # Courses, enrollments, quizzes, certifications
├── fleet/                  # Vehicles, drivers, routes, fuel, maintenance, ePOD
├── asterisk/               # VoIP, SIP, call logs, IVR, auto-dialer, queues
├── prm/                    # Partner lifecycle, deal registration, MDF, SPIFFs
├── ecommerce/              # Products, orders, carts, subscriptions, loyalty, CLV
├── saas-platform/          # Tenant provisioning, module activation, billing, events
├── data-residency/         # Regional hosting, migration
├── mobile/                 # Apps, push notifications (APNS/FCM)
├── offline-sync/           # Change tracking, conflict resolution
└── sandbox/                # Test environments

modules/
├── support-ticket/         # Helpdesk, SLA, comments, CSAT
├── knowledge-base/         # Articles, categories, search, deflection
├── inventory/              # Stock, warehouses, movements, suppliers
├── marketing-campaign/     # Campaigns, lead scoring, attribution
├── gamification/           # Leaderboards, badges, challenges
└── project/                # Projects, tasks, time tracking, Gantt, P&L
```

### SaaS Deployment

```bash
# Production deploy with all services
cd packages/twenty-docker
cp docker-compose.saas.env .env
# Edit .env with real credentials
docker compose -f docker-compose.saas.yml up -d
```

Stack: Nginx Gateway + Twenty Server + Worker + Frontend + Asterisk + PostgreSQL + Redis

### Module Activation (per tenant)

Modules activate via `SaaSPlatformService`:
```typescript
await saas.provisionTenant(workspaceId, { companyName: 'Acme', country: CountryCode.CO, plan: SubscriptionPlan.PROFESSIONAL });
await saas.activateModule(workspaceId, 'inventory');
await saas.activateModule(workspaceId, 'asterisk');
```

### LATAM Fiscal Support

| Country | Provider | Tax | Status |
|---------|----------|-----|--------|
| Colombia | DIAN (UBL 2.1, XAdES) | IVA 19% | Ready |
| Mexico | SAT (CFDI 4.0 via PAC) | IVA 16% | Ready |
| Rep. Dominicana | DGII (e-CF, SOAP) | ITBIS 18% | Ready |
| Chile | SII (DTE, REST) | IVA 19% | Config |
| Peru | SUNAT (UBL, CDR) | IGV 18% | Config |
| Argentina | AFIP | IVA 21% | Config |
| Brazil | NF-e (SEFAZ) | ICMS/ISS | Config |

### Key Files

- `core-engine.module.ts` — All module registrations
- `packages/twenty-shared/src/types/FeatureFlagKey.ts` — Module + fiscal flags
- `packages/twenty-docker/docker-compose.saas.yml` — Production deploy
- `packages/twenty-docker/gateway/nginx.conf` — API Gateway config
- `packages/twenty-docker/init-db.sql` — RLS + audit triggers
