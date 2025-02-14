# Twenty Development Rules

## General
- Twenty is an open source CRM built with Typescript (React, NestJS)

### Main Packages / folders
- packages/twenty-front: Main Frontend (React)
- packages/twenty-server: Main Backend (NestJS)
- packages/twenty-website: Marketing website + docs (NextJS)
- packages/twenty-ui: UI library (React)
- packages/twenty-shared: Shared utils, constants, types

### Development Stack
- Package Manager: yarn
- Monorepo: nx
- Database: PostgreSQL + TypeORM (core, metadata schemas)
- State Management: Recoil
- Data Management: Apollo / GraphQL
- Cache: redis
- Auth: JWT
- Queue: BullMQ
- Storage: S3/local filesystem
- Testing Backend: Jest, Supertest
- Testing Frontend: Jest, Storybook, MSW
- Testing E2E: Playwright

## Styling
- Use @emotion/styled, never CSS classes/Tailwind
- Prefix styled components with 'Styled'
- Keep styled components at top of file
- Use Theme object for colors/spacing/typography
- Use Theme values instead of px/rem
- Use mq helper for media queries

## TypeScript
- No 'any' type - use proper typing
- Use type over interface
- String literals over enums (except GraphQL)
- Props suffix for component props types
- Use type inference when possible
- Enable strict mode and noImplicitAny

## React
- Only functional components
- Named exports only
- No useEffect, prefer event handlers
- Small focused components
- Proper prop naming (onClick, isActive)
- Destructure props with types

## State Management
- Recoil for global state
- Apollo Client for GraphQL/server state
- Atoms in states/ directory
- Multiple small atoms over prop drilling
- No useRef for state
- Extract data fetching to siblings
- useRecoilValue/useRecoilState appropriately

## File Structure
- One component per file
- Features in modules/
- Hooks in hooks/
- States in states/
- Types in types/
- PascalCase components, camelCase others

## Translation
- Use @lingui/react/macro
- Use <Trans> within components
- Use t`string` elsewhere (from useLingui hook)
- Don't translate metadata (field names, object names, etc)
- Don't translate mocks

## Code Style
- Early returns
- No nested ternaries
- No else-if
- Optional chaining over &&
- Small focused functions
- Clear variable names
- No console.logs in commits
- Few comments, prefer code readability

## GraphQL
- Use gql tag
- Separate operation files
- Proper codegen typing
- Consistent naming (getX, updateX)
- Use fragments
- Use generated types

## Testing
- Test every feature
- React Testing Library
- Test behavior not implementation
- Mock external deps
- Use data-testid
- Follow naming conventions
