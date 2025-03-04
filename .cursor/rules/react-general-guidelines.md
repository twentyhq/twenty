# React Guidelines

## Core React Principles
Twenty follows modern React best practices with a focus on functional components and clean, maintainable code. This document outlines our React conventions and best practices.

## Component Structure

### Functional Components Only
- Use functional components exclusively
- No class components allowed
  ```typescript
  // ✅ Correct
  export const UserProfile = ({ user }: UserProfileProps) => {
    return (
      <StyledContainer>
        <h1>{user.name}</h1>
      </StyledContainer>
    );
  };

  // ❌ Incorrect
  export class UserProfile extends React.Component<UserProfileProps> {
    render() {
      return (
        <StyledContainer>
          <h1>{this.props.user.name}</h1>
        </StyledContainer>
      );
    }
  }
  ```

### Named Exports
- Use named exports exclusively
- No default exports
  ```typescript
  // ✅ Correct
  export const Button = ({ label }: ButtonProps) => {
    return <button>{label}</button>;
  };

  // ❌ Incorrect
  export default function Button({ label }: ButtonProps) {
    return <button>{label}</button>;
  }
  ```

## State and Effects

### Event Handlers Over useEffect
- Prefer event handlers for state updates
- Avoid useEffect for state synchronization
  ```typescript
  // ✅ Correct
  const UserForm = () => {
    const handleSubmit = async (data: FormData) => {
      await updateUser(data);
      refreshUserList();
    };

    return <Form onSubmit={handleSubmit} />;
  };

  // ❌ Incorrect
  const UserForm = () => {
    useEffect(() => {
      if (formData) {
        updateUser(formData);
      }
    }, [formData]);

    return <Form />;
  };
  ```

## Component Design

### Small, Focused Components
- Keep components small and single-purpose
- Extract reusable logic into custom hooks
  ```typescript
  // ✅ Correct
  const UserCard = ({ user }: UserCardProps) => {
    return (
      <StyledCard>
        <UserAvatar user={user} />
        <UserInfo user={user} />
        <UserActions user={user} />
      </StyledCard>
    );
  };

  // ❌ Incorrect
  const UserCard = ({ user }: UserCardProps) => {
    return (
      <StyledCard>
        {/* Too much logic in one component */}
        <img src={user.avatar} />
        <div>{user.name}</div>
        <div>{user.email}</div>
        <button onClick={() => handleEdit(user)}>Edit</button>
        <button onClick={() => handleDelete(user)}>Delete</button>
        {/* More complex logic... */}
      </StyledCard>
    );
  };
  ```

## Props

### Prop Naming
- Use clear, descriptive prop names
- Follow React conventions (onClick, isActive, etc.)
  ```typescript
  // ✅ Correct
  type ButtonProps = {
    onClick: () => void;
    isDisabled?: boolean;
    isLoading?: boolean;
  };

  // ❌ Incorrect
  type ButtonProps = {
    clickHandler: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  ```

### Prop Destructuring
- Destructure props with proper typing
- Use TypeScript for prop types
  ```typescript
  // ✅ Correct
  const Button = ({ onClick, isDisabled, children }: ButtonProps) => {
    return (
      <button onClick={onClick} disabled={isDisabled}>
        {children}
      </button>
    );
  };

  // ❌ Incorrect
  const Button = (props: ButtonProps) => {
    return (
      <button onClick={props.onClick} disabled={props.isDisabled}>
        {props.children}
      </button>
    );
  };
  ```

## Performance Optimization

### Memoization
- Use memo for expensive computations
- Avoid premature optimization
  ```typescript
  // ✅ Correct - Complex computation
  const MemoizedChart = memo(({ data }: ChartProps) => {
    // Complex rendering logic
    return <ComplexChart data={data} />;
  });

  // ❌ Incorrect - Unnecessary memoization
  const MemoizedText = memo(({ text }: { text: string }) => {
    return <span>{text}</span>;
  });
  ```

### Event Handlers
- Use callback refs for DOM manipulation
- Memoize callbacks when needed
  ```typescript
  // ✅ Correct
  const UserList = () => {
    const handleScroll = useCallback((event: UIEvent) => {
      // Complex scroll handling
    }, []);

    return <div onScroll={handleScroll}>{/* content */}</div>;
  };
  ```

## Error Handling

### Error Boundaries
- Use error boundaries for component error handling
- Provide meaningful fallback UIs
  ```typescript
  // ✅ Correct
  const ErrorFallback = ({ error }: { error: Error }) => (
    <StyledError>
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
    </StyledError>
  );

  const SafeComponent = () => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ComponentThatMightError />
    </ErrorBoundary>
  );
  ```

### Loading States
- Handle loading states gracefully
- Provide meaningful loading indicators
  ```typescript
  // ✅ Correct
  const UserProfile = () => {
    const { data: user, isLoading, error } = useUser();

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    if (!user) return <NotFound />;

    return <UserProfileContent user={user} />;
  };
  ``` 