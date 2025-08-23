---
description: React state management guidelines for Twenty CRM
alwaysApply: false
---
# React State Management

## Recoil Patterns
```typescript
// ✅ Atoms for primitive state
export const currentUserState = atom<User | null>({
  key: 'currentUserState',
  default: null,
});

// ✅ Selectors for derived state
export const userDisplayNameSelector = selector({
  key: 'userDisplayNameSelector',
  get: ({ get }) => {
    const user = get(currentUserState);
    return user ? `${user.firstName} ${user.lastName}` : 'Guest';
  },
});

// ✅ Atom families for dynamic atoms
export const userByIdState = atomFamily<User | null, string>({
  key: 'userByIdState',
  default: null,
});
```

## Local State Guidelines
```typescript
// ✅ Multiple useState for unrelated state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<User[]>([]);

// ✅ useReducer for complex state logic
type FormAction = 
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'RESET' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
};
```

## Data Flow Rules
- **Props down, events up** - Unidirectional data flow
- **Avoid bidirectional binding** - Use callback functions
- **Normalize complex data** - Use lookup tables over nested objects

```typescript
// ✅ Normalized state structure
type UsersState = {
  byId: Record<string, User>;
  allIds: string[];
};

// ✅ Functional state updates
const increment = useCallback(() => {
  setCount(prev => prev + 1);
}, []);
```

## Performance Tips
- Use atom families for dynamic data collections
- Implement proper selector caching
- Avoid heavy computations in selectors
- Batch state updates when possible
