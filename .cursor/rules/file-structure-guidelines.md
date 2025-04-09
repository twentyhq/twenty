# File Structure Guidelines

## Core File Structure Principles
Twenty follows a modular and organized file structure that promotes maintainability and scalability. This document outlines our file organization conventions and best practices.

## Component Organization

### One Component Per File
- Each component should have its own file
- File name should match component name
  ```typescript
  // ✅ Correct
  // UserProfile.tsx
  export const UserProfile = () => {
    return <div>...</div>;
  };

  // ❌ Incorrect
  // users.tsx
  export const UserProfile = () => {
    return <div>...</div>;
  };

  export const UserList = () => {
    return <div>...</div>;
  };
  ```

## Directory Structure

### Feature Modules
- Place features in `modules/` directory
- Group related components and logic
  ```
  modules/
  ├── users/
  │   ├── components/
  │   │   ├── UserList.tsx
  │   │   ├── UserCard.tsx
  │   │   └── UserProfile.tsx
  │   ├── hooks/
  │   │   └── useUser.ts
  │   ├── states/
  │   │   └── userStates.ts
  │   └── types/
  │       └── user.ts
  ├── workspace/
  │   ├── components/
  │   ├── hooks/
  │   └── states/
  └── settings/
      ├── components/
      ├── hooks/
      └── states/
  ```

### Hooks Organization
- Place hooks in `hooks/` directory
- Group by feature or global usage
  ```
  hooks/
  ├── useClickOutside.ts
  ├── useDebounce.ts
  └── features/
      ├── users/
      │   ├── useUserActions.ts
      │   └── useUserData.ts
      └── workspace/
          └── useWorkspaceSettings.ts
  ```

### State Management
- Place state definitions in `states/` directory
- Organize by feature
  ```
  states/
  ├── global/
  │   ├── theme.ts
  │   └── navigation.ts
  ├── users/
  │   ├── atoms.ts
  │   └── selectors.ts
  └── workspace/
      ├── atoms.ts
      └── selectors.ts
  ```

### Types Organization
- Place types in `types/` directory
- Group by domain or feature
  ```
  types/
  ├── common.ts
  ├── api.ts
  └── features/
      ├── user.ts
      ├── workspace.ts
      └── settings.ts
  ```

## Naming Conventions

### Component Files
- Use PascalCase for component files
- Use descriptive, feature-specific names
  ```
  components/
  ├── UserProfile.tsx
  ├── UserProfileHeader.tsx
  └── UserProfileContent.tsx
  ```

### Non-Component Files
- Use camelCase for non-component files
- Use clear, descriptive names
  ```
  hooks/
  ├── useClickOutside.ts
  └── useDebounce.ts

  utils/
  ├── dateFormatter.ts
  └── stringUtils.ts
  ```

## Module Structure

### Feature Module Organization
- Consistent structure across features
- Clear separation of concerns
  ```
  modules/users/
  ├── components/
  │   ├── UserList/
  │   │   ├── UserList.tsx
  │   │   ├── UserListItem.tsx
  │   │   └── UserListHeader.tsx
  │   └── UserProfile/
  │       ├── UserProfile.tsx
  │       └── UserProfileHeader.tsx
  ├── hooks/
  │   ├── useUserList.ts
  │   └── useUserProfile.ts
  ├── states/
  │   ├── atoms.ts
  │   └── selectors.ts
  ├── types/
  │   └── user.ts
  └── utils/
      └── userFormatter.ts
  ```

## Best Practices

### Import Organization
- Group imports by type
- Maintain consistent order
  ```typescript
  // External dependencies
  import { useState } from 'react';
  import { styled } from '@emotion/styled';

  // Internal modules
  import { useUser } from '~/modules/users/hooks';
  import { userState } from '~/modules/users/states';

  // Local imports
  import { UserAvatar } from './UserAvatar';
  import { type UserProfileProps } from './types';
  ```

### Path Aliases
- Use path aliases for better imports
- Avoid deep relative paths
  ```typescript
  // ✅ Correct
  import { Button } from '~/components/Button';
  import { useUser } from '~/modules/users/hooks';

  // ❌ Incorrect
  import { Button } from '../../../components/Button';
  import { useUser } from '../../../modules/users/hooks';
  ```

### Component Co-location
- Keep related files close together
- Use index files for public APIs
  ```
  components/UserProfile/
  ├── UserProfile.tsx
  ├── UserProfileHeader.tsx
  ├── UserProfileContent.tsx
  ├── styles.ts
  ├── types.ts
  └── index.ts
  ```

### Test File Location
- Place test files next to implementation
- Use `.test.ts` or `.spec.ts` extension
  ```
  components/
  ├── UserProfile.tsx
  ├── UserProfile.test.tsx
  ├── UserProfile.stories.tsx
  └── types.ts
  ``` 