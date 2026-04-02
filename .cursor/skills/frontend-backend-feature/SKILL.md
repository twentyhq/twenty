---
name: frontend-backend-feature
description: End-to-end guide for building a full-stack feature spanning twenty-server (NestJS) and twenty-front (React). Use when implementing a feature that requires both backend API changes and frontend UI, to ensure all layers are wired correctly.
---

# Full-Stack Feature (Frontend + Backend)

**Purpose**: Orchestration guide for building a feature that spans both the server and frontend. References the individual skills for each layer and adds the wiring steps between them.

**When to use**: When your feature needs a new backend endpoint/entity AND a frontend UI to consume it.

---

## Overview: Build Order

Always build **backend first**, then **frontend**. This ensures types flow correctly through codegen.

```
1. Backend entity + service + resolver + module
       ↓
2. Frontend GraphQL fragments + queries + mutations
       ↓
3. Run codegen (generates typed Document nodes)
       ↓
4. Frontend hooks consuming generated types
       ↓
5. Frontend state (Jotai atoms if needed)
       ↓
6. Frontend components + routing
       ↓
7. Customization tracking
       ↓
8. Verify (typecheck + lint + test)
```

---

## Phase 1: Backend

Follow the [backend-module skill](../backend-module/SKILL.md):

1. **Entity** — Define TypeORM entity with columns and relations
2. **DTOs** — Create input types for create/update operations
3. **Service** — Business logic layer
4. **Resolver** — GraphQL API with guards and decorators
5. **Module** — NestJS module registration
6. **Migration** — Generate and review TypeORM migration
7. **Query hooks** — If needed for auto-population or validation, follow the [query-hooks skill](../query-hooks/SKILL.md)

**Verify backend compiles:**
```bash
npx nx typecheck twenty-server
```

**Optionally test the API** before building frontend:
```bash
npx nx start twenty-server
# Then query via GraphQL playground or curl
```

---

## Phase 2: GraphQL Codegen Bridge

This is the critical bridge between backend and frontend.

Follow the [graphql-operations skill](../graphql-operations/SKILL.md):

1. **Fragments** — Define field selections matching your resolver output
2. **Queries** — Define queries matching your resolver's `@Query()` methods
3. **Mutations** — Define mutations matching your resolver's `@Mutation()` methods
4. **Run codegen:**

```bash
# For metadata endpoint (most Omnia features)
npx nx run twenty-front:graphql:generate --configuration=metadata

# For workspace endpoint
npx nx run twenty-front:graphql:generate
```

5. **Verify generated types exist** in `src/generated-metadata/graphql.ts` or `src/generated/graphql.ts`

---

## Phase 3: Frontend

### Hooks

Create hooks that consume the generated Document types:

```typescript
import { useQuery } from '@apollo/client/react';
import { FindManyMyEntitiesDocument } from '~/generated-metadata/graphql';

export const useMyEntities = () => {
  const { data, loading } = useQuery(FindManyMyEntitiesDocument);
  return { entities: data?.findManyMyEntities ?? [], loading };
};
```

### State (if needed)

Follow the [jotai-state skill](../jotai-state/SKILL.md) if the feature needs shared state beyond what Apollo cache provides.

**When to use Jotai vs Apollo cache:**
| Scenario | Use |
|----------|-----|
| Server data fetched via GraphQL | Apollo cache (automatic) |
| UI state shared across components | Jotai atom |
| Derived data from multiple sources | Jotai selector |
| User preferences | Jotai with localStorage |
| Single-component state | React `useState` |

### Components

Follow the [frontend-module skill](../frontend-module/SKILL.md):

1. Create components in `modules/{feature}/components/`
2. Wire hooks and state into components
3. Add route if page-level (lazy-loaded in `useCreateAppRouter.tsx`)

For settings pages, follow the [settings-page skill](../settings-page/SKILL.md) instead.

---

## Phase 4: Customization Tracking

Follow the [customization-tracking skill](../customization-tracking/SKILL.md):

1. Update `CUSTOMIZATIONS.md` with all new and modified files
2. Add checks to `scripts/check-customizations.sh`
3. Run `./scripts/check-customizations.sh` to verify

---

## Phase 5: Verification

Run all checks:

```bash
# Type checking (both packages)
npx nx typecheck twenty-server
npx nx typecheck twenty-front

# Lint (diff-only for speed)
npx nx lint:diff-with-main twenty-front
npx nx lint:diff-with-main twenty-server

# Tests (if you wrote any)
npx jest path/to/test.test.ts --config=packages/PROJECT/jest.config.mjs

# Customization check
./scripts/check-customizations.sh
```

---

## Common Pitfalls

### Forgetting codegen
**Symptom**: TypeScript errors about missing Document types or wrong return types.
**Fix**: Run codegen after any GraphQL schema or operation change.

### Fragment mismatch
**Symptom**: Query returns `null` for fields you expected.
**Fix**: Ensure your fragment includes all fields you need. Check that the fragment type matches the resolver return type.

### Wrong codegen endpoint
**Symptom**: Your generated types don't appear in the expected file.
**Fix**: Metadata operations (auth, roles, views, field metadata) → `--configuration=metadata`. Workspace operations (workflows, search) → default config.

### Missing module registration
**Symptom**: `Nest can't resolve dependencies` error on server start.
**Fix**: Ensure your module is imported in the parent module and all services are listed in `providers`.

### Missing guard
**Symptom**: Resolver returns unauthorized error.
**Fix**: Add `@UseGuards(WorkspaceAuthGuard)` to your resolver class.

---

## Quick Reference: Which Skill for What

| Task | Skill |
|------|-------|
| New NestJS module with entity/resolver | [backend-module](../backend-module/SKILL.md) |
| CRUD interception hooks | [query-hooks](../query-hooks/SKILL.md) |
| GraphQL fragments/queries/mutations + codegen | [graphql-operations](../graphql-operations/SKILL.md) |
| New frontend feature module | [frontend-module](../frontend-module/SKILL.md) |
| Jotai atoms and selectors | [jotai-state](../jotai-state/SKILL.md) |
| Settings page UI | [settings-page](../settings-page/SKILL.md) |
| CUSTOMIZATIONS.md + check script | [customization-tracking](../customization-tracking/SKILL.md) |
| Workspace migration entities | [syncable-entity-* skills](../README.md) |
