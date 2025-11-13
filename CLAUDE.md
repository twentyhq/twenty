# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twenty is an open-source CRM built with modern technologies in a monorepo structure. The codebase is organized as an Nx workspace with multiple packages managed by Yarn 4.

## Key Commands

### Development
```bash
# Start full development environment (frontend + backend + worker)
yarn start

# Individual package development
npx nx start twenty-front                    # Start frontend dev server (Vite)
npx nx start twenty-server                   # Start NestJS backend server
npx nx run twenty-server:worker              # Start BullMQ background worker

# Run multiple targets across projects
npx nx run-many --target=build --all         # Build all packages
npx nx run-many --target=test --projects=twenty-front,twenty-server

# View dependency graph
npx nx graph

# Check affected projects
npx nx affected --target=test --base=main
```

### Testing
```bash
# Frontend tests
npx nx test twenty-front                     # Run unit tests with Jest
npx nx test twenty-front --watch             # Run tests in watch mode
npx nx test twenty-front --coverage          # Generate coverage report

# Backend tests
npx nx test twenty-server                    # Run unit tests
npx nx run twenty-server:test:integration:with-db-reset  # Integration tests with DB reset

# Storybook testing
npx nx storybook:build twenty-front          # Build Storybook
npx nx storybook:serve:dev twenty-front      # Serve Storybook in development
npx nx storybook:serve-and-test:static twenty-front  # Build and run Storybook tests

# E2E tests
npx nx test:e2e twenty-e2e-testing           # Run Playwright E2E tests

# Note: When testing the UI end to end, click on "Continue with Email" and use the prefilled credentials.
```

### Code Quality
```bash
# Linting
npx nx lint twenty-front                     # Frontend linting
npx nx lint twenty-server                    # Backend linting
npx nx lint twenty-front --fix               # Auto-fix linting issues
npx nx run-many --target=lint --all          # Lint all packages

# Type checking
npx nx typecheck twenty-front                # Frontend type checking
npx nx typecheck twenty-server               # Backend type checking

# Formatting
npx nx fmt twenty-front                      # Check formatting with Prettier
npx nx fmt twenty-front --write=true         # Format and write changes
```

### Build
```bash
# Build specific packages
npx nx build twenty-front                    # Build frontend (Vite)
npx nx build twenty-server                   # Build backend (TypeScript)
npx nx build twenty-ui                       # Build UI component library

# Build all packages
npx nx run-many --target=build --all
```

### Database Operations
```bash
# Database management
npx nx database:reset twenty-server          # Reset database
npx nx run twenty-server:database:init:prod  # Initialize database for production
npx nx run twenty-server:database:migrate:prod # Run migrations in production

# Generate migration
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/common/[name] -d src/database/typeorm/core/core.datasource.ts

# Sync workspace metadata
npx nx run twenty-server:command workspace:sync-metadata
npx nx run twenty-server:command workspace:sync-metadata -f  # Force sync
```

### GraphQL
```bash
# Generate GraphQL types for frontend
npx nx run twenty-front:graphql:generate
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Recoil (state management), Emotion (styling), Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL (with GraphQL Yoga)
- **Monorepo**: Nx workspace managed with Yarn 4 (Node.js 24.5.0 required)
- **Testing**: Jest (unit), Playwright (E2E), Storybook (component)
- **Build Tools**: Vite (frontend), esbuild (bundling), SWC (compilation)

### Package Structure
```
packages/
├── twenty-front/          # React frontend application (Vite + React 18)
├── twenty-server/         # NestJS backend API (GraphQL + REST)
├── twenty-ui/             # Shared UI components library
├── twenty-shared/         # Common types and utilities
├── twenty-emails/         # Email templates with React Email
├── twenty-website/        # Next.js documentation website
├── twenty-docs/           # Documentation content
├── twenty-zapier/         # Zapier integration
├── twenty-e2e-testing/    # Playwright E2E tests
├── twenty-sdk/            # SDK for API integration
├── twenty-apps/           # App integrations
├── twenty-cli/            # CLI tools
└── twenty-utils/          # Utility functions
```

### Critical Development Principles

**TypeScript Rules (Strictly Enforced)**
- **No 'any' type allowed** - TypeScript strict mode enabled
- **Types over interfaces** - Use `type` for definitions (except when extending third-party interfaces)
- **String literals over enums** - Use union types instead of enums (except GraphQL enums)
- Suffix component props with 'Props' (e.g., `ButtonProps`)
- Leverage type inference when clear, explicit typing when ambiguous

**React Rules**
- **Functional components only** - No class components
- **Named exports only** - No default exports
- **Event handlers over useEffect** - Prefer direct event handling for state updates
- Destructure props in component signatures
- Small, focused components with single responsibility
- Extract complex logic into custom hooks

**Code Style**
- **Prettier**: 2-space indentation, single quotes, trailing commas, 80 char line width
- **Naming**: camelCase for variables/functions, PascalCase for types/components, kebab-case for files
- **Comments**: Short-form comments (//), NOT JSDoc blocks (/** */)
- **Imports**: Order by external → internal → relative

**Nx Workspace Conventions**
- Each package has `project.json` with target definitions
- Use `@/` path mapping for internal imports
- Libraries export through index.ts barrel files
- Nx caches build outputs and test results

### State Management Architecture
- **Recoil** for global state management
  - Atoms for shared state
  - Selectors for derived state
  - Component-specific state with React hooks
- **Apollo Client** manages GraphQL cache
- **React hooks** for local component state

### Backend Architecture
- **NestJS modules** for feature organization
- **TypeORM** for database ORM with PostgreSQL
- **GraphQL API** with code-first approach (GraphQL Yoga)
- **Redis** for caching and session management
- **BullMQ** for background job processing
- **Migration pattern**: Generate migrations with TypeORM CLI, never modify schema directly

### Database
- **PostgreSQL** - Primary database for application data
- **Redis** - Caching and session storage
- **TypeORM migrations** - All schema changes via migrations
- **ClickHouse** - Analytics (when enabled)
- Metadata sync required after object model changes

## Development Workflow

### Before Making Changes
1. Run linting and type checking after code changes
2. Test changes with relevant test suites
3. Ensure database migrations are properly structured
4. Check GraphQL schema changes are backward compatible
5. Generate GraphQL types if schema changes

### Component Development
- Use **Emotion** for styling with styled-components pattern
- Follow **Nx** workspace conventions for imports
- Use **Lingui** for internationalization (i18n)
- Components should be in their own directories with:
  - Component file (`.tsx`)
  - Styles file (`.styles.ts`)
  - Test file (`.test.tsx`)
  - Storybook story (`.stories.tsx`)

### Testing Strategy
- **Unit tests** - Jest for both frontend and backend
- **Integration tests** - Critical backend workflows with database
- **Storybook** - Component development, visual testing, and interaction tests
- **E2E tests** - Playwright for critical user flows
- Always include tests for new features and bug fixes

### Security Patterns
- CSV Export: Always sanitize then format (`formatValueForCSV(sanitizeValueForCSVExport(input))`)
- Input validation before processing
- Use type guards for runtime type checking

## Important Files & Directories
- `nx.json` - Nx workspace configuration with task definitions and caching
- `tsconfig.base.json` - Base TypeScript configuration with path mappings
- `package.json` - Root package with workspace definitions
- `eslint.config.mjs` - ESLint configuration
- `.cursor/rules/` - Development guidelines and best practices (MDC format)
- `tools/eslint-rules/` - Custom ESLint rules
