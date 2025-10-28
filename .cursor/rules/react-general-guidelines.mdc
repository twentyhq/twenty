---
description: React general guidelines for Twenty CRM
alwaysApply: false
---
# React Guidelines

## Core Rules
- **Functional components only** (no classes)
- **Named exports only** (no default exports)
- **Event handlers over useEffect** for state updates

## Component Structure
```typescript
// ✅ Correct
export const UserProfile = ({ user, onEdit }: UserProfileProps) => {
  const handleEdit = () => onEdit(user.id);
  
  return (
    <StyledContainer>
      <h1>{user.name}</h1>
      <Button onClick={handleEdit}>Edit</Button>
    </StyledContainer>
  );
};
```

## Props & Event Handlers
```typescript
// ✅ Correct - Destructure props
const Button = ({ onClick, isDisabled, children }: ButtonProps) => (
  <button onClick={onClick} disabled={isDisabled}>
    {children}
  </button>
);

// ✅ Correct - Event handlers over useEffect
const UserForm = ({ onSubmit }: UserFormProps) => {
  const handleSubmit = async (data: FormData) => {
    await onSubmit(data);
    // Direct event handling, not useEffect
  };

  return <Form onSubmit={handleSubmit} />;
};
```

## Component Design
- **Small, focused components** - Single responsibility
- **Composition over inheritance** - Combine simple components
- **Extract complex logic** into custom hooks

```typescript
// ✅ Good - Composed from smaller components
const UserCard = ({ user }: UserCardProps) => (
  <StyledCard>
    <UserAvatar user={user} />
    <UserInfo user={user} />
    <UserActions user={user} />
  </StyledCard>
);
```

## Performance
```typescript
// ✅ Use memo for expensive components only
const ExpensiveChart = memo(({ data }: ChartProps) => {
  // Complex rendering logic
  return <ComplexChart data={data} />;
});

// ✅ Memoize callbacks when needed
const UserList = ({ users, onUserSelect }: UserListProps) => {
  const handleUserSelect = useCallback((user: User) => {
    onUserSelect(user);
  }, [onUserSelect]);

  return (
    <div>
      {users.map(user => (
        <UserItem key={user.id} user={user} onSelect={handleUserSelect} />
      ))}
    </div>
  );
};
```
