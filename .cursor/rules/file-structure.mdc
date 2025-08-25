---
description: File structure guidelines for Twenty CRM
globs: []
alwaysApply: true
---
# File Structure Guidelines

## Directory Organization
```
packages/twenty-front/src/
├── components/      # Reusable UI components
├── pages/          # Route components  
├── modules/        # Feature modules
├── hooks/          # Custom hooks
├── services/       # API services
└── types/          # Type definitions

packages/twenty-server/src/
├── modules/        # Feature modules
├── entities/       # Database entities
├── dto/           # Data transfer objects
└── utils/         # Helper functions
```

## File Naming
- **kebab-case** for all files and directories
- **Descriptive suffixes** for clarity
```
// ✅ Correct naming
user-profile.component.tsx
user-profile.styles.ts
user-profile.test.tsx
user.service.ts
user.entity.ts
create-user.dto.ts
```

## Index Files & Barrel Exports
```typescript
// ✅ Clean barrel exports in index.ts
export { UserCard } from './user-card.component';
export { UserList } from './user-list.component';
export type { UserCardProps, UserListProps } from './types';

// ✅ Usage - clean imports
import { UserCard, UserList } from '@/components/user';
```

## Module Structure
```
src/modules/user/
├── components/     # Module-specific components
├── hooks/         # Module hooks
├── services/      # API services
├── types/         # Type definitions
└── index.ts       # Module exports
```

## Import/Export Patterns
```typescript
// ✅ Import organization
// 1. External libraries
import React from 'react';
import styled from 'styled-components';

// 2. Internal modules (absolute paths)
import { Button } from '@/components/ui';
import { UserService } from '@/services';

// 3. Relative imports
import { UserCardProps } from './types';

// ✅ Named exports only (no default exports)
export const UserComponent = ({ user }: UserProps) => {
  // Component implementation
};
```

## File Size Guidelines
- **Components**: Under 300 lines
- **Services**: Under 500 lines  
- **Extract logic** into hooks/utilities when files grow large
- **Use composition** over large monolithic components

## Configuration Files

### Project Configuration
```
.vscode/                       # VSCode settings
├── settings.json
├── extensions.json
└── launch.json

.github/                       # GitHub workflows
├── workflows/
└── templates/

.cursor/                       # Cursor rules
├── rules/
└── environment.json
```

### Build Configuration
- Keep build configs in root or package directories
- Use consistent naming for config files
- Comment complex configurations
- Version control all configuration files
