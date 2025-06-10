# Twenty Development Rules

This directory contains Twenty's development guidelines and best practices. The rules are organized into several key categories:

## Guidelines Structure

### 1. Architecture and Structure
- `architecture.md`: Project overview, technology stack, and infrastructure setup
- `file-structure-guidelines.md`: File and directory organization patterns

### 2. Code Style and Development
- `typescript-guidelines.md`: TypeScript best practices and conventions
- `code-style-guidelines.md`: General coding standards and style guide

### 3. React Development
- `react-general-guidelines.md`: Core React development principles and patterns
- `react-state-management-guidelines.md`: State management approaches and best practices

### 4. Testing
- `testing-guidelines.md`: Testing strategies, patterns, and best practices

### 5. Internationalization
- `translations.md`: Translation workflow, i18n setup, and string management

## Common Development Commands

### Frontend Commands
```bash
# Testing
npx nx test twenty-front                    # Run unit tests
npx nx storybook:build twenty-front         # Build Storybook
npx nx storybook:serve-and-test:static     # Run Storybook tests

# Development
npx nx lint twenty-front                    # Run linter
npx nx typecheck twenty-front               # Type checking
npx nx run twenty-front:graphql:generate    # Generate GraphQL types
```

### Backend Commands
```bash
# Database
npx nx database:reset twenty-server         # Reset database
npx nx run twenty-server:database:init:prod # Initialize database
npx nx run twenty-server:database:migrate:prod # Run migrations

# Development
npx nx run twenty-server:start             # Start the server
npx nx run twenty-server:lint              # Run linter (add --fix to auto-fix)
npx nx run twenty-server:typecheck         # Type checking
npx nx run twenty-server:test              # Run unit tests
npx nx run twenty-server:test:integration:with-db-reset # Run integration tests

# Migrations
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/metadata/migrations/[name] -d src/database/typeorm/metadata/metadata.datasource.ts

# Workspace
npx nx run twenty-server:command workspace:sync-metadata -f  # Sync metadata
```

## Usage

These rules are automatically attached to relevant files in your workspace through Cursor's context system. They help maintain consistency and quality across the Twenty codebase.

For the most up-to-date version of these guidelines, always refer to the files in this directory. 