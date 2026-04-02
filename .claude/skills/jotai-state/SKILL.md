---
name: jotai-state
description: Create and use Jotai atoms and selectors in twenty-front using the project's helper utilities. Use when adding new state management, creating derived state, or wiring state into components.
---

# Jotai State Management

**Purpose**: Guide for creating and consuming Jotai state in Twenty's frontend using the project-specific helper utilities (`createAtomState`, `createAtomFamilySelector`).

**When to use**: When adding new state to a module — simple atoms, derived selectors, persistent storage, or component-scoped state.

---

## Key Rule: Use Twenty's Helpers, Not Raw Jotai

Twenty wraps Jotai with project-specific utilities. **Always use these instead of raw `atom()` / `selector()`:**

| Twenty Helper | Raw Jotai Equivalent | Use When |
|---------------|---------------------|----------|
| `createAtomState` | `atom()` | Simple read/write state |
| `createAtomFamilySelector` | `atomFamily()` + `atom()` | Derived or parameterized state |
| `useAtomStateValue` | `useAtomValue()` | Read-only access |
| `useAtomState` | `useAtom()` | Read + write access |

---

## File Conventions

```
modules/{module}/states/
├── {stateName}State.ts              # Simple atoms
├── {selectorName}Selector.ts        # Derived selectors
└── {familyName}ComponentState.ts    # Component-scoped family state
```

- **One atom/selector per file**
- File name matches the export name exactly
- Atoms end with `State` (e.g., `currentUserState`)
- Selectors end with `Selector` (e.g., `objectPermissionsFamilySelector`)
- Component-scoped state ends with `ComponentState` or `ComponentFamilyState`

---

## Simple Atom

**File**: `modules/my-feature/states/myFeatureSelectedItemState.ts`

```typescript
import { createAtomState } from '@/ui/utilities/state/utils/createAtomState';

export const myFeatureSelectedItemState = createAtomState<string | null>({
  key: 'myFeatureSelectedItemState',
  defaultValue: null,
});
```

**Rules:**
- `key` must be globally unique (use the full variable name as the key)
- `defaultValue` is required
- Generic type parameter defines the state shape

---

## Atom with Local Storage Persistence

```typescript
import { createAtomState } from '@/ui/utilities/state/utils/createAtomState';

export const myFeaturePreferenceState = createAtomState<'grid' | 'list'>({
  key: 'myFeaturePreferenceState',
  defaultValue: 'grid',
  useLocalStorage: true,
  localStorageOptions: {
    getOnInit: true,  // Read from localStorage on first load
  },
});
```

Use for user preferences that should survive page refreshes.

---

## Atom with Cookie Storage

```typescript
import { createAtomState } from '@/ui/utilities/state/utils/createAtomState';

export const myTokenState = createAtomState<string | null>({
  key: 'myTokenState',
  defaultValue: null,
  useCookieStorage: {
    cookieKey: 'my_token',
    attributes: {
      expires: 7,    // days
      secure: true,
    },
    validateInitFn: (value) => typeof value === 'string' && value.length > 0,
  },
});
```

Use for auth tokens or values that need to be available server-side.

---

## Derived Selector (Family)

For state derived from other atoms, or parameterized lookups:

**File**: `modules/my-feature/states/myFeatureItemByIdSelector.ts`

```typescript
import { createAtomFamilySelector } from '@/ui/utilities/state/utils/createAtomFamilySelector';

import { myFeatureItemsState } from '@/my-feature/states/myFeatureItemsState';
import type { MyFeatureItem } from '@/my-feature/types/MyFeatureItem';

export const myFeatureItemByIdSelector = createAtomFamilySelector<
  MyFeatureItem | undefined,    // Return type
  { itemId: string }             // Parameter type
>({
  key: 'myFeatureItemByIdSelector',
  get:
    ({ itemId }) =>
    ({ get }) => {
      const items = get(myFeatureItemsState);

      return items.find((item) => item.id === itemId);
    },
});
```

**Usage in component:**

```typescript
const item = useAtomValue(
  myFeatureItemByIdSelector({ itemId: 'some-id' }),
);
```

---

## Component-Scoped State

For state that's tied to a specific component instance (e.g., per-widget, per-row):

**File**: `modules/my-feature/states/myFeatureWidgetComponentFamilyState.ts`

```typescript
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const myFeatureWidgetComponentFamilyState =
  createComponentFamilyState<boolean>({
    key: 'myFeatureWidgetComponentFamilyState',
    defaultValue: false,
  });
```

---

## Consuming State in Components

### Read-only

```typescript
import { useAtomStateValue } from '@/ui/utilities/state/hooks/useAtomStateValue';
import { myFeatureSelectedItemState } from '@/my-feature/states/myFeatureSelectedItemState';

export const MyComponent = () => {
  const selectedItem = useAtomStateValue(myFeatureSelectedItemState);

  return <div>{selectedItem}</div>;
};
```

### Read + Write

```typescript
import { useAtomState } from '@/ui/utilities/state/hooks/useAtomState';
import { myFeatureSelectedItemState } from '@/my-feature/states/myFeatureSelectedItemState';

export const MyComponent = () => {
  const [selectedItem, setSelectedItem] = useAtomState(
    myFeatureSelectedItemState,
  );

  return (
    <button onClick={() => setSelectedItem('new-value')}>
      Current: {selectedItem}
    </button>
  );
};
```

### Write-only (rare)

```typescript
import { useSetAtomState } from '@/ui/utilities/state/hooks/useSetAtomState';

const setSelectedItem = useSetAtomState(myFeatureSelectedItemState);
```

---

## When to Use What

| Scenario | Pattern |
|----------|---------|
| Simple flag or value shared across components | `createAtomState` |
| User preference that survives refresh | `createAtomState` with `useLocalStorage: true` |
| Derived data from other atoms | `createAtomFamilySelector` |
| Lookup by ID from a list atom | `createAtomFamilySelector` with ID param |
| Per-component-instance state | `createComponentFamilyState` |
| Local-only, single-component state | Regular `useState` (don't over-atomize) |

**Don't reach for Jotai when `useState` is enough.** If the state is only used within one component and doesn't need to be shared or persisted, use React's built-in `useState`.

---

## Anti-Patterns

- **Don't create atoms inside components.** Atoms should be defined at module level in `states/` files.
- **Don't use raw `atom()` from jotai.** Always use `createAtomState` or `createAtomFamilySelector`.
- **Don't duplicate keys.** Each key must be globally unique. Use the full variable name as the key.
- **Don't subscribe to heavy atoms in table cells.** This was a real performance issue — 900+ Jotai subscriptions per table. Keep per-row subscriptions minimal; compute in hooks or selectors instead.

---

## Checklist

- [ ] Atom defined in `states/` directory with one per file
- [ ] Key string matches the export variable name
- [ ] Uses `createAtomState` or `createAtomFamilySelector` (not raw jotai)
- [ ] File name matches the export name
- [ ] Consumed via `useAtomStateValue` / `useAtomState` (not raw jotai hooks)
- [ ] State is actually needed at module level (not over-atomized `useState` replacement)
- [ ] No atoms created inside component bodies
