# Twenty Project Architecture

## Overview
Twenty is an open-source CRM built with modern technologies, using TypeScript for both frontend and backend development. This document outlines the core architectural decisions and structure of the project.

## Monorepo Structure
The project is organized as a monorepo using nx, with the following main packages:

### Main Packages
- `packages/twenty-front`: Main Frontend application
  - Technology: React
  - Purpose: Provides the main user interface for the CRM
  - Key responsibilities: User interactions, state management, data display

- `packages/twenty-server`: Main Backend application
  - Technology: NestJS
  - Purpose: Handles business logic, data persistence, and API
  - Key responsibilities: Data processing, authentication, API endpoints

- `packages/twenty-website`: Marketing Website and Documentation
  - Technology: NextJS
  - Purpose: Public-facing website and documentation
  - Key responsibilities: Marketing content, documentation, SEO

- `packages/twenty-ui`: UI Component Library
  - Technology: React
  - Purpose: Shared UI components and design system
  - Key responsibilities: Reusable components, design consistency

- `packages/twenty-shared`: Shared Utilities
  - Purpose: Cross-package shared code between frontend and backend
  - Contents: Utils, constants, types, interfaces

## Core Technology Stack

### Package Management
- Package Manager: yarn
- Monorepo Tool: nx
- Benefits: Consistent dependency management, shared configurations

### Database Layer
- Primary Database: PostgreSQL
- Schema Structure:
  - Core schema: Main application data
  - Metadata schema: Configuration and customization data
  - Workspace schemas: One schema per tenant, containing tenant-specific data
- ORM Layer:
  - TypeORM: For core and metadata schemas
    - Purpose: Type-safe database operations for system data
    - Benefits: Strong typing, migration support
  - TwentyORM: For workspace schemas
    - Purpose: Manages tenant-specific entities and customizations
    - Benefits: Dynamic entity management, per-tenant customization
    - Example: Entities like CompanyWorkspaceEntity are managed per workspace

### State Management
- Frontend State: Recoil
  - Purpose: Global state management
  - Use cases: User preferences, UI state, cached data

### Data Layer
- API Technology: GraphQL
- Client: Apollo Client
  - Purpose: Data fetching and caching
  - Benefits: Type safety, efficient data loading

### Infrastructure
- Cache: Redis
  - Purpose: High-performance caching layer
  - Use cases: Session data, frequent queries

- Authentication: JWT
  - Purpose: Secure user authentication
  - Implementation: Token-based auth flow

- Queue System: BullMQ
  - Purpose: Background job processing
  - Use cases: Emails, exports, imports

- Storage: S3/Local Filesystem
  - Purpose: File storage and management
  - Flexibility: Configurable for cloud or local storage

### Testing Infrastructure
- Backend Testing:
  - Framework: Jest
  - API Testing: Supertest
  - Coverage: Unit tests, integration tests

- Frontend Testing:
  - Framework: Jest
  - Component Testing: Storybook
  - API Mocking: MSW (Mock Service Worker)

- End-to-End Testing:
  - Framework: Playwright
  - Coverage: Critical user journeys 