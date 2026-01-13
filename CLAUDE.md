# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Quick Start - Autonomous Mode

**Claude operates autonomously using Linear for task management.**

1. **On session start:** Check Linear for tasks with `claude-ready` label
2. **Pick task:** Highest priority, oldest first
3. **Execute:** Use skills and specialists as needed
4. **Update Linear:** Progress comments, status changes
5. **Repeat:** Move to next task

See `.claude/agents/linear-orchestrator.md` for full workflow.

## Linear Labels

| Label | Meaning |
|-------|---------|
| `claude-ready` | Ready for Claude to pick up |
| `claude-wip` | Claude is working on it |
| `claude-blocked` | Needs human input |
| `claude-review` | Ready for human review |

---

## Project Overview

Twenty is an open-source CRM built with modern technologies in a monorepo structure. The codebase is organized as an Nx workspace with multiple packages.

## Key Commands

### Development

```bash
# Start development environment (frontend + backend + worker)
yarn start

# Individual package development
npx nx start twenty-front     # Start frontend dev server
npx nx start twenty-server    # Start backend server
npx nx run twenty-server:worker  # Start background worker
```

### Testing

```bash
# Run tests
npx nx test twenty-front      # Frontend unit tests
npx nx test twenty-server     # Backend unit tests
npx nx run twenty-server:test:integration:with-db-reset  # Integration tests with DB reset

# Storybook
npx nx storybook:build twenty-front         # Build Storybook
npx nx storybook:serve-and-test:static twenty-front     # Run Storybook tests

# When testing the UI end to end, click on "Continue with Email" and use the prefilled credentials.
```

### Code Quality

```bash
# Linting (diff with main - fastest)
npx nx lint:diff-with-main twenty-front           # Lint only files changed vs main
npx nx lint:diff-with-main twenty-server          # Lint only files changed vs main
npx nx lint:diff-with-main twenty-front --configuration=fix  # Auto-fix files changed vs main

# Type checking
npx nx typecheck twenty-front
npx nx typecheck twenty-server

# Format code
npx nx fmt twenty-front
npx nx fmt twenty-server
```

### Build

```bash
npx nx build twenty-front
npx nx build twenty-server
```

### Database Operations

```bash
# Database management
npx nx database:reset twenty-server         # Reset database
npx nx run twenty-server:database:init:prod # Initialize database
npx nx run twenty-server:database:migrate:prod # Run migrations

# Generate migration
npx nx run twenty-server:typeorm migration:generate src/database/typeorm/core/migrations/common/[name] -d src/database/typeorm/core/core.datasource.ts

# Sync metadata
npx nx run twenty-server:command workspace:sync-metadata
```

### GraphQL

```bash
npx nx run twenty-front:graphql:generate
```

---

## Architecture Overview

### Tech Stack

- **Frontend**: React 18, TypeScript, Recoil (state management), Emotion (styling), Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL (with GraphQL Yoga)
- **Monorepo**: Nx workspace managed with Yarn 4

### Package Structure

```
packages/
├── twenty-front/          # React frontend application
├── twenty-server/         # NestJS backend API
├── twenty-ui/             # Shared UI components library
├── twenty-shared/         # Common types and utilities
├── twenty-emails/         # Email templates with React Email
├── twenty-website/        # Next.js documentation website
├── twenty-zapier/         # Zapier integration
└── twenty-e2e-testing/    # Playwright E2E tests
```

### Key Development Principles

- **Functional components only** (no class components)
- **Named exports only** (no default exports)
- **Types over interfaces** (except when extending third-party interfaces)
- **String literals over enums** (except for GraphQL enums)
- **No 'any' type allowed**
- **Event handlers preferred over useEffect** for state updates

---

## Agents & Skills

### Available Agents

| Agent | Use For |
|-------|---------|
| `linear-orchestrator` | Autonomous task coordination |
| `twenty-specialist` | Twenty CRM codebase work |
| `journey-crm-specialist` | Journey Engine + CRM integration |
| `context-engine-specialist` | Retrieval and context |
| `orchestrator` | Cross-domain coordination |

### Key Skills

| Skill | When |
|-------|------|
| `using-superpowers` | Session start |
| `brainstorming` | Before creative work |
| `writing-plans` | Before multi-step implementation |
| `executing-plans` | Following written plans |
| `systematic-debugging` | Bug investigation |

See `.claude/skills/SKILL-LIST.md` for full list.

---

## MCP Integrations

- **Postgres** - Database queries (requires `PG_DATABASE_URL` env var)
- **Playwright** - E2E browser testing
- **Context7** - Library documentation lookup
- **n8n-smartout-mcp** - Workflow automation (n8n.smartout.org)

---

## Development Workflow

### Before Making Changes

1. Check Linear for current task context
2. Run linting and type checking after code changes
3. Test changes with relevant test suites
4. Ensure database migrations are properly structured
5. Check that GraphQL schema changes are backward compatible

### Code Style Notes

- Use **Emotion** for styling with styled-components pattern
- Follow **Nx** workspace conventions for imports
- Use **Lingui** for internationalization
- Components should be in their own directories with tests and stories

### Testing Strategy

- **Unit tests** with Jest for both frontend and backend
- **Integration tests** for critical backend workflows
- **Storybook** for component development and testing
- **E2E tests** with Playwright for critical user flows

---

## Important Files

- `nx.json` - Nx workspace configuration with task definitions
- `tsconfig.base.json` - Base TypeScript configuration
- `package.json` - Root package with workspace definitions
- `.claude/agents/` - Agent definitions
- `.claude/skills/` - Skill definitions
- `docs/plans/` - Implementation plans

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
