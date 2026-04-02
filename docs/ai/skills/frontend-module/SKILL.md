---
name: frontend-module
description: Create a new frontend feature module in twenty-front with the standard directory structure, components, hooks, state, and GraphQL operations. Use when adding a new feature area to the frontend.
---

# Frontend Module Creation

**Purpose**: Step-by-step guide for creating a new frontend feature module in `packages/twenty-front/src/modules/` with the standard directory structure and conventions.

**When to use**: When adding a new feature area that needs its own components, hooks, state, or GraphQL operations.

---

## Module Directory Structure

```
packages/twenty-front/src/modules/{module-name}/
├── components/                    # React components
│   ├── {ModuleName}Content.tsx    # Main content component (if page-level)
│   └── internal/                  # Private sub-components (not exported)
├── hooks/                         # Custom React hooks
│   └── use{ActionName}.ts
├── states/                        # Jotai atoms and selectors
│   └── {stateName}State.ts
├── graphql/                       # GraphQL operations
│   ├── fragments/
│   ├── queries/
│   └── mutations/
├── types/                         # TypeScript types
│   └── {TypeName}.ts
├── utils/                         # Pure utility functions
│   └── {utilName}.ts
└── constants/                     # Constants (if needed)
    └── {CONSTANT_NAME}.ts
```

Not every module needs every directory. Create only what you need.

---

## Step 1: Create the Module Directory

Directory name uses **kebab-case**:

```
modules/my-feature/
```

---

## Step 2: Define Types

**File**: `modules/my-feature/types/MyFeatureItem.ts`

```typescript
export type MyFeatureItem = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
};
```

**Conventions:**
- One type per file
- File name matches the type name (`PascalCase.ts`)
- Use `type` over `interface` (project convention)
- Use string literal unions over enums (project convention)

---

## Step 3: Create Components

### Main component

**File**: `modules/my-feature/components/MyFeatureContent.tsx`

```typescript
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';

export const MyFeatureContent = () => {
  return (
    <Section>
      <H2Title
        title="My Feature"
        description="Description of what this section does"
      />
      {/* Content */}
    </Section>
  );
};
```

### Internal sub-components

**File**: `modules/my-feature/components/internal/MyFeatureListItem.tsx`

```typescript
export const MyFeatureListItem = ({ item }: { item: MyFeatureItem }) => {
  return <div>{item.name}</div>;
};
```

**Component conventions:**
- File name matches component name (`PascalCase.tsx`)
- Named exports only (no default exports)
- Functional components only (no class components)
- Props destructured inline or as a typed parameter
- Internal/private components go in `internal/` subdirectory

---

## Step 4: Create Hooks

**File**: `modules/my-feature/hooks/useMyFeatureItems.ts`

```typescript
import { useQuery } from '@apollo/client/react';
import { FindManyMyFeatureItemsDocument } from '~/generated-metadata/graphql';

export const useMyFeatureItems = () => {
  const { data, loading } = useQuery(FindManyMyFeatureItemsDocument);

  return {
    items: data?.getMyFeatureItems ?? [],
    loading,
  };
};
```

**Hook conventions:**
- File name matches hook name: `use{Name}.ts`
- Always start with `use` prefix
- Return an object (not a tuple) for readability
- One hook per file

---

## Step 5: Create State (Jotai)

**File**: `modules/my-feature/states/myFeatureSelectedItemState.ts`

```typescript
import { createAtomState } from '@/ui/utilities/state/utils/createAtomState';

import type { MyFeatureItem } from '@/my-feature/types/MyFeatureItem';

export const myFeatureSelectedItemState = createAtomState<MyFeatureItem | null>({
  key: 'myFeatureSelectedItemState',
  defaultValue: null,
});
```

For derived/parameterized state:

**File**: `modules/my-feature/states/myFeatureItemByIdSelector.ts`

```typescript
import { createAtomFamilySelector } from '@/ui/utilities/state/utils/createAtomFamilySelector';

export const myFeatureItemByIdSelector = createAtomFamilySelector<
  MyFeatureItem | undefined,
  { itemId: string }
>({
  key: 'myFeatureItemByIdSelector',
  get: ({ itemId }) => ({ get }) => {
    const items = get(myFeatureItemsState);
    return items.find((item) => item.id === itemId);
  },
});
```

**State conventions:**
- One atom/selector per file
- File name matches the export name
- Key string matches the export name
- Use `createAtomState` for simple state
- Use `createAtomFamilySelector` for derived/parameterized state
- State names end with `State` or `Selector`

**Using state in components:**

```typescript
import { useAtomStateValue } from '@/ui/utilities/state/hooks/useAtomStateValue';
import { useAtomState } from '@/ui/utilities/state/hooks/useAtomState';

// Read only
const selectedItem = useAtomStateValue(myFeatureSelectedItemState);

// Read and write
const [selectedItem, setSelectedItem] = useAtomState(myFeatureSelectedItemState);
```

---

## Step 6: Add GraphQL Operations

Follow the [graphql-operations skill](../graphql-operations/SKILL.md) for the full workflow:

1. Define fragments in `graphql/fragments/`
2. Define queries in `graphql/queries/`
3. Define mutations in `graphql/mutations/`
4. Run codegen
5. Wire into hooks

---

## Step 7: Add Route (if page-level)

Routes are defined in `packages/twenty-front/src/modules/app/hooks/useCreateAppRouter.tsx`.

Add a lazy import and route:

```typescript
const MyFeaturePage = lazy(() =>
  import('~/pages/my-feature/MyFeaturePage').then((module) => ({
    default: module.MyFeaturePage,
  })),
);
```

Then add the `<Route>` element in the appropriate location within the router tree.

Create the page component:

**File**: `packages/twenty-front/src/pages/my-feature/MyFeaturePage.tsx`

```typescript
import { MyFeatureContent } from '@/my-feature/components/MyFeatureContent';

export const MyFeaturePage = () => {
  return <MyFeatureContent />;
};
```

---

## Import Aliases

| Alias | Resolves to | Usage |
|-------|------------|-------|
| `@/` | `src/modules/` | Module-to-module imports: `@/my-feature/hooks/useMyFeature` |
| `~/` | `src/` | Root-level imports: `~/generated-metadata/graphql`, `~/pages/` |
| `twenty-ui/` | UI package | UI components: `twenty-ui/input`, `twenty-ui/display`, `twenty-ui/layout` |
| `twenty-shared/` | Shared package | Shared types/utils |

---

## Checklist

- [ ] Module directory uses kebab-case
- [ ] Components use PascalCase file names and named exports
- [ ] Hooks use `use` prefix and one-per-file
- [ ] State atoms use `createAtomState` with unique key strings
- [ ] Types use `type` keyword (not `interface`)
- [ ] String literals used instead of enums
- [ ] Imports use `@/` alias for cross-module references
- [ ] GraphQL operations follow the [graphql-operations skill](../graphql-operations/SKILL.md)
- [ ] Route added (if page-level feature)
- [ ] `npx nx typecheck twenty-front` passes
- [ ] Customization tracking updated (if modifying upstream files) — see [customization-tracking skill](../customization-tracking/SKILL.md)
