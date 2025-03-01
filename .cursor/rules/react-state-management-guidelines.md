# State Management Guidelines

## Core State Management Principles
Twenty uses a combination of Recoil for global state and Apollo Client for server state management. This document outlines our state management conventions and best practices.

## Global State Management

### Recoil Usage
- Use Recoil for global application state
- Keep atoms small and focused
  ```typescript
  // ✅ Correct
  // states/theme.ts
  export const themeState = atom<'light' | 'dark'>({
    key: 'themeState',
    default: 'light',
  });

  // states/user.ts
  export const userState = atom<User | null>({
    key: 'userState',
    default: null,
  });

  // ❌ Incorrect
  // states/globalState.ts
  export const globalState = atom({
    key: 'globalState',
    default: {
      theme: 'light',
      user: null,
      settings: {},
      // ... many other unrelated pieces of state
    },
  });
  ```

### Atom Organization
- Place atoms in the `states/` directory
- Group related atoms in feature-specific files
  ```typescript
  // states/workspace/atoms.ts
  export const workspaceIdState = atom<string>({
    key: 'workspaceIdState',
    default: '',
  });

  export const workspaceSettingsState = atom<WorkspaceSettings>({
    key: 'workspaceSettingsState',
    default: defaultSettings,
  });
  ```

## Server State Management

### Apollo Client Usage
- Use Apollo Client for all GraphQL operations
- Leverage Apollo's caching capabilities
  ```typescript
  // ✅ Correct
  const { data, loading } = useQuery(GET_USER_QUERY, {
    variables: { id },
    fetchPolicy: 'cache-first',
  });

  // ❌ Incorrect
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/user/' + id).then(setUser);
  }, [id]);
  ```

### Query Organization
- Separate operation files
- Use fragments for shared fields
  ```typescript
  // queries/user.ts
  export const UserFragment = gql`
    fragment UserFields on User {
      id
      name
      email
    }
  `;

  export const GET_USER = gql`
    query GetUser($id: ID!) {
      user(id: $id) {
        ...UserFields
      }
    }
    ${UserFragment}
  `;
  ```

## State Management Best Practices

### Multiple Small Atoms
- Prefer multiple small atoms over prop drilling
- Keep atoms focused on specific features
  ```typescript
  // ✅ Correct
  export const selectedViewState = atom<string>({
    key: 'selectedViewState',
    default: '',
  });

  export const viewFiltersState = atom<ViewFilters>({
    key: 'viewFiltersState',
    default: {},
  });

  // ❌ Incorrect - Prop drilling
  const ViewContainer = ({ selectedView, filters, onViewChange }) => {
    return (
      <ViewHeader view={selectedView} onViewChange={onViewChange}>
        <ViewContent>
          <ViewFilters filters={filters} />
        </ViewContent>
      </ViewHeader>
    );
  };
  ```

### No useRef for State
- Never use useRef for state management
- Use proper state management tools
  ```typescript
  // ✅ Correct
  const [count, setCount] = useState(0);
  // or
  const [count, setCount] = useRecoilState(countState);

  // ❌ Incorrect
  const countRef = useRef(0);
  ```

### Data Fetching
- Extract data fetching to sibling components
- Keep components focused on presentation
  ```typescript
  // ✅ Correct
  const UserProfileContainer = () => {
    const { data, loading } = useQuery(GET_USER);
    if (loading) return <LoadingSpinner />;
    return <UserProfile user={data.user} />;
  };

  const UserProfile = ({ user }: UserProfileProps) => {
    return <div>{user.name}</div>;
  };

  // ❌ Incorrect
  const UserProfile = () => {
    const { data, loading } = useQuery(GET_USER);
    if (loading) return <LoadingSpinner />;
    return <div>{data.user.name}</div>;
  };
  ```

### Hook Usage
- Use appropriate hooks for state access
- Choose between useRecoilValue and useRecoilState based on needs
  ```typescript
  // ✅ Correct - Read-only access
  const theme = useRecoilValue(themeState);

  // ✅ Correct - Read-write access
  const [theme, setTheme] = useRecoilState(themeState);

  // ❌ Incorrect - Using state setter when only reading
  const [theme, _] = useRecoilState(themeState);
  ```

## Performance Considerations

### Selector Usage
- Use selectors for derived state
- Memoize complex calculations
  ```typescript
  // ✅ Correct
  const filteredUsersState = selector({
    key: 'filteredUsersState',
    get: ({ get }) => {
      const users = get(usersState);
      const filter = get(userFilterState);
      return users.filter(user => 
        user.name.toLowerCase().includes(filter.toLowerCase())
      );
    },
  });

  // ❌ Incorrect - Calculating in component
  const UserList = () => {
    const users = useRecoilValue(usersState);
    const filter = useRecoilValue(userFilterState);
    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    );
    return <List users={filteredUsers} />;
  };
  ```

### Cache Management
- Configure appropriate cache policies
- Handle cache invalidation properly
  ```typescript
  // ✅ Correct
  const [updateUser] = useMutation(UPDATE_USER, {
    update: (cache, { data }) => {
      cache.modify({
        id: cache.identify(data.updateUser),
        fields: {
          name: () => data.updateUser.name,
        },
      });
    },
  });
  ``` 