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

### GraphQL
```bash
# Generate GraphQL types (run after schema changes)
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Jotai (state management), Emotion (styling), Vite
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

### After Making Changes (MANDATORY)
**IMPORTANT: You MUST run the customization check after ANY of the following:**
- Merging upstream (twentyhq/twenty) changes
- Modifying any file listed in `CUSTOMIZATIONS.md`
- Resolving merge conflicts
- Any change touching RLS, permissions, spreadsheet import/export, or navigation

```bash
./scripts/check-customizations.sh
```

If any check fails (shows RED), you **must** fix it before committing. This script verifies that Omnia's critical customizations haven't been accidentally overwritten. See `CUSTOMIZATIONS.md` for details on each customization.

Also re-extract Lingui translations if any `.po` files changed or new `t` tagged strings were added:
```bash
npx nx run twenty-front:lingui:extract && npx nx run twenty-front:lingui:compile
```

### Code Style Notes
- Use **Emotion** for styling with styled-components pattern
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

## CI Environment (GitHub Actions)

When running in CI, the dev environment is **not** pre-configured. Dependencies are installed but builds, env files, and databases are not set up.

- **Before running tests, builds, lint, type checks, or DB operations**, run: `bash packages/twenty-utils/setup-dev-env.sh`
- **Skip the setup script** for tasks that only read code — architecture questions, code review, documentation, etc.
- The script is idempotent and safe to run multiple times.

## Important Files
- `nx.json` - Nx workspace configuration with task definitions
- `tsconfig.base.json` - Base TypeScript configuration
- `package.json` - Root package with workspace definitions
- `.cursor/rules/` - Detailed development guidelines and best practices
- `CUSTOMIZATIONS.md` - **All Omnia customizations on top of upstream Twenty** — check after every upstream merge
- `scripts/check-customizations.sh` - Automated check for overwritten customizations

## Upstream Merge Process

This is a fork of [twentyhq/twenty](https://github.com/twentyhq/twenty). When merging upstream changes:

1. **Before merge**: Read `CUSTOMIZATIONS.md` to know what's at risk
2. **After merge**: Run `./scripts/check-customizations.sh` to detect overwritten code
3. **Re-extract Lingui**: `npx nx run twenty-front:lingui:extract && npx nx run twenty-front:lingui:compile`
4. **Key files that get wiped repeatedly**:
   - `useBuildRecordInputFromRLSPredicates.ts` — indirect RLS relation resolution (Agent→WorkspaceMember)
   - `SettingsRolePermissionsObjectLevelObjectForm.tsx` — Organization plan gate on RLS
   - Lingui `.po` files — custom translation strings
   - Sidebar/navigation components — layout preferences
5. **After deploy**: Flush Redis cache: `cache:flat-cache-invalidate --all-metadata`
6. **Verify**: Log in as member role, create a policy, check RLS settings UI

## Custom Omnia Modules (Server)

These are 100% custom and don't exist upstream:
- `packages/twenty-server/src/modules/agent-profile/` — AgentProfile resolver for RLS
- `packages/twenty-server/src/modules/policy/` — Policy query hooks (agentId auto-assign, name derivation, LTV)
- `packages/twenty-server/src/modules/call/` — Call query hooks (agentId auto-assign)
- `packages/twenty-server/src/modules/lead/` — Lead/Person query hooks

## Production (Kubernetes)

- **Cluster**: EKS `twenty-crm` (us-east-1), AWS profile `twenty-admin`
- **Namespace**: `twentycrm` (production), `twentycrm-staging` (staging)
- **Flush cache**: `kubectl exec -n twentycrm <server-pod> -c server -- node /app/packages/twenty-server/dist/command/command.js cache:flat-cache-invalidate --all-metadata`
- **Server logs**: `kubectl logs -n twentycrm -l app.kubernetes.io/component=server -c server --tail=100`

## Planning phases

Please put all planning documents in /plans as we can iterate on these and keep track of them as we go along.
