---
description: Twenty CRM architecture overview - monorepo structure, tech stack, and development principles
globs: []
alwaysApply: true
---

# Twenty Architecture

## Tech Stack
- **Frontend**: React 18, TypeScript, Recoil, Styled Components, Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL
- **Monorepo**: Nx workspace with yarn

## Package Structure
```
packages/
├── twenty-front/     # React app
├── twenty-server/    # NestJS API  
├── twenty-ui/        # Shared components
├── twenty-shared/    # Common types/utils
└── twenty-emails/    # Email templates
```

## Key Principles
- **Functional components only** (no classes)
- **Named exports only** (no default exports)
- **Types over interfaces** (except for extending third-party)
- **String literals over enums** (except GraphQL)
- **No 'any' type allowed**
- **Event handlers over useEffect** for state updates
