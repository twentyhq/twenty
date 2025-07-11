# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twenty is an open-source CRM built with TypeScript, React, and NestJS. It's a monorepo using Nx workspace for managing multiple packages.

## Core Technology Stack

- **Frontend**: React 18, TypeScript, Recoil (state management), Styled Components, Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL
- **Monorepo**: Nx workspace with yarn 4.x
- **Testing**: Jest, Playwright, Storybook
- **Node.js**: v22.12.0

## Package Structure

```
packages/
├── twenty-front/        # React frontend application
├── twenty-server/       # NestJS backend API
├── twenty-ui/          # Shared UI components library
├── twenty-shared/      # Common types and utilities
├── twenty-emails/      # Email templates
├── twenty-chrome-extension/  # Chrome extension
├── twenty-e2e-testing/ # End-to-end tests
├── twenty-zapier/      # Zapier integration
└── twenty-website/     # Marketing website
```

## Development Commands

### Global Commands
```bash
# Start the full application (frontend + backend + worker)
npm start

# Root-level commands for the entire workspace
npx nx run-many -t lint           # Lint all packages
npx nx run-many -t test           # Test all packages
npx nx run-many -t build          # Build all packages
npx nx run-many -t typecheck      # Type check all packages
```

### Frontend (twenty-front)
```bash
# Development
npx nx start twenty-front                    # Start dev server
npx nx build twenty-front                    # Build for production
npx nx lint twenty-front                     # Run linter
npx nx lint twenty-front --fix               # Fix linting issues
npx nx typecheck twenty-front                # Type checking
npx nx test twenty-front                     # Run unit tests
npx nx fmt twenty-front                      # Format code
npx nx fmt twenty-front --fix                # Format and fix code

# GraphQL
npx nx graphql:generate twenty-front         # Generate GraphQL types

# Storybook
npx nx storybook:serve:dev twenty-front      # Start Storybook dev server
npx nx storybook:build twenty-front          # Build Storybook
npx nx storybook:test twenty-front           # Run Storybook tests
```

### Backend (twenty-server)
```bash
# Development
npx nx start twenty-server                   # Start server in dev mode
npx nx build twenty-server                   # Build for production
npx nx lint twenty-server                    # Run linter
npx nx lint twenty-server --fix              # Fix linting issues
npx nx typecheck twenty-server               # Type checking
npx nx test twenty-server                    # Run unit tests
npx nx test:integration twenty-server        # Run integration tests

# Database
npx nx database:reset twenty-server          # Reset database with seed data
npx nx database:migrate twenty-server        # Run database migrations
npx nx database:migrate:revert twenty-server # Revert last migration

# Worker
npx nx worker twenty-server                  # Start queue worker

# Commands
npx nx command twenty-server                 # Run CLI commands
```

### Single Test Commands
```bash
# Run a single test file
npx nx test twenty-front --testNamePattern="ComponentName"
npx nx test twenty-server --testNamePattern="ServiceName"

# Run tests in watch mode
npx nx test twenty-front --watch
npx nx test twenty-server --watch
```

## Code Style and Architecture

### Key Development Principles
- **No default exports** - Use named exports only
- **Types over interfaces** - Use `type` instead of `interface` (except for extending third-party)
- **String literals over enums** - Use union types instead of enums (except GraphQL)
- **No 'any' type** - Strict TypeScript with explicit typing
- **Functional components only** - No class components
- **Event handlers over useEffect** - Prefer event-driven state updates

### File and Directory Naming
- **kebab-case** for all files and directories
- **PascalCase** for types and component names
- **camelCase** for variables and functions
- **SCREAMING_SNAKE_CASE** for constants

### Import Organization
1. External libraries first
2. Internal modules with absolute paths (`@/`)
3. Relative imports last

### Component Structure
```typescript
// Component props must be suffixed with 'Props'
type ButtonProps = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
};

// Named export only
export const Button = ({ label, onClick, variant }: ButtonProps) => {
  // Component implementation
};
```

## Architecture Notes

### Frontend Architecture
- **Recoil** for state management
- **Styled Components** for styling
- **GraphQL** with Apollo Client for API communication
- **Vite** for build tooling
- **Storybook** for component documentation

### Backend Architecture
- **NestJS** with modular architecture
- **TypeORM** for database operations
- **GraphQL** API with type-safe resolvers
- **BullMQ** for job queuing
- **PostgreSQL** as primary database
- **Redis** for caching and queues

### Database
- PostgreSQL with TypeORM migrations
- ClickHouse for analytics (optional)
- Database reset includes seeding with development data

### Testing Strategy
- **Jest** for unit tests
- **Playwright** for e2e tests
- **Storybook** for component testing
- **MSW** for API mocking

## Environment Setup

### Required Tools
- Node.js v22.12.0
- Yarn 4.x (specified in package.json)
- PostgreSQL
- Redis

### Common Development Tasks
1. **Adding new features**: Start with database entities, then GraphQL resolvers, then frontend components
2. **Database changes**: Create migrations using TypeORM CLI
3. **GraphQL changes**: Run codegen after schema changes
4. **Testing**: Write tests for new functionality, run relevant test suites

## Troubleshooting

### Common Issues
- **Build failures**: Check TypeScript errors with `npx nx typecheck`
- **GraphQL issues**: Regenerate types with `npx nx graphql:generate`
- **Database issues**: Reset database with `npx nx database:reset`
- **Dependency issues**: Clear cache and reinstall with `yarn install`

### Performance
- Use `NODE_OPTIONS="--max-old-space-size=8192"` for memory-intensive operations
- Storybook builds require increased memory allocation