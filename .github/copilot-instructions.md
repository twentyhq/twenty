# Twenty CRM - AI Coding Instructions

Twenty is an open-source CRM built as an Nx monorepo with React (frontend) and NestJS (backend).

## Architecture Overview

### Package Structure
- `twenty-front/` — React 18 app with Recoil state, Emotion styling, Vite bundler
- `twenty-server/` — NestJS API with TypeORM, PostgreSQL, Redis, GraphQL
- `twenty-ui/` — Shared component library
- `twenty-shared/` — Common types and utilities
- `twenty-emails/` — React Email templates

### Backend Engine (`twenty-server/src/engine/`)
The engine handles workspace-level concerns: ORM, metadata, caching, and migrations. Feature modules live in `src/modules/` (messaging, calendar, workflow, etc.).

### Frontend Modules (`twenty-front/src/modules/`)
Feature-based organization: `object-record/`, `workflow/`, `views/`, `settings/`, etc. Each module contains components, hooks, services, and types.

## Essential Commands

```bash
# Development
yarn start                    # Start all services (frontend + backend + worker)
npx nx start twenty-front     # Frontend only
npx nx start twenty-server    # Backend only

# Linting (prefer diff-based for speed)
npx nx lint:diff-with-main twenty-front
npx nx lint:diff-with-main twenty-server --configuration=fix

# Testing
npx jest path/to/test.test.ts --config=packages/twenty-front/jest.config.mjs
npx jest path/to/test.spec.ts --config=packages/twenty-server/jest.config.mjs

# Database migrations (always generate, don't write manually)
npx nx run twenty-server:typeorm migration:generate \
  src/database/typeorm/core/migrations/common/[name] \
  -d src/database/typeorm/core/core.datasource.ts

# GraphQL codegen
npx nx run twenty-front:graphql:generate
```

## Code Style Requirements

### TypeScript
- **No `any` type** — use proper typing or `unknown`
- **`type` over `interface`** — except when extending third-party interfaces
- **String literals over enums** — except for GraphQL enums
- **Named exports only** — no default exports
- **No abbreviations** — use `user` not `u`, `fieldMetadata` not `fm`

### React Components
- **Functional components only** — no class components
- **Event handlers over useEffect** — for state updates triggered by user actions
- **Recoil for global state** — atoms, selectors, atomFamily patterns
- **Emotion styled-components** — for styling

### File Naming
```
user-profile.component.tsx    # Components
user-profile.styles.ts        # Styles
user-profile.test.tsx         # Frontend tests (.test.ts)
user.service.spec.ts          # Backend tests (.spec.ts)
create-user.dto.ts            # DTOs
```

## Key Patterns

### State Management (Recoil)
```typescript
// Atoms for primitive state
export const currentUserState = atom<User | null>({
  key: 'currentUserState',
  default: null,
});

// Selectors for derived state
export const userDisplayNameSelector = selector({
  key: 'userDisplayNameSelector',
  get: ({ get }) => get(currentUserState)?.firstName ?? 'Guest',
});
```

### Backend Resolvers (NestJS + GraphQL)
```typescript
@Resolver()
export class DashboardResolver {
  @Query(() => DashboardDTO)
  async getDashboard(@Args('id') id: string) { ... }

  @Mutation(() => DashboardDTO)
  async createDashboard(@Args('input') input: CreateDashboardInput) { ... }
}
```

### Database Entity Changes
When modifying `*.entity.ts` files, **always generate a migration**:
```bash
npx nx run twenty-server:typeorm migration:generate \
  src/database/typeorm/core/migrations/common/add-field-name \
  -d src/database/typeorm/core/core.datasource.ts
```

## Testing Conventions

- **AAA pattern**: Arrange, Act, Assert
- **Descriptive names**: "should [behavior] when [condition]"
- **Test behavior, not implementation**
- **Frontend**: `.test.ts` extension, query by user-visible elements
- **Backend**: `.spec.ts` extension

## Internationalization

Uses Lingui for i18n. Wrap user-facing strings:
```typescript
import { t } from '@lingui/macro';
const message = t`Welcome back`;
```

## Key Files Reference

- `nx.json` — Workspace targets and caching configuration
- `.cursor/rules/` — Detailed development guidelines
- `packages/twenty-server/src/engine/` — Core ORM and metadata system
- `packages/twenty-front/src/modules/object-record/` — Generic record CRUD patterns
