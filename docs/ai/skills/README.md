# Shared AI Skills

These folders contain the shared source of truth for reusable repo-specific
skills and playbooks.

## How They Are Used

- Cursor skill wrappers are mirrored into `.cursor/skills/*`
- Claude Code skill wrappers are mirrored into `.claude/skills/*`
- Codex should read these files directly as detailed playbooks referenced from
  `AGENTS.md`

## Workflow

1. Edit `docs/ai/skills/*`
2. Run `yarn sync:ai-instructions`
3. Commit the shared skill folders and the mirrored `.cursor/skills/*` and
   `.claude/skills/*` folders together

## Current Shared Skills

### Feature Development

- `frontend-module` — Create a new frontend feature module with standard
  directory structure, components, hooks, state, and GraphQL operations
- `backend-module` — Create a new NestJS backend module with resolver, service,
  entity, DTOs, and module registration
- `graphql-operations` — Add or modify GraphQL queries, mutations, and fragments
  in twenty-front, including codegen and hook wiring
- `query-hooks` — Create pre-query and post-query hooks to intercept CRUD
  operations on workspace objects (auto-populate fields, enforce business rules,
  trigger side effects)
- `jotai-state` — Create and consume Jotai atoms and selectors using the
  project's helper utilities
- `settings-page` — Create a new settings page or section following the standard
  component hierarchy and routing patterns
- `frontend-backend-feature` — End-to-end orchestration guide for full-stack
  features spanning twenty-server and twenty-front
- `customization-tracking` — Track Omnia-specific customizations in
  CUSTOMIZATIONS.md and check-customizations.sh (non-negotiable for all changes)

### Syncable Entities (Workspace Migration)

- `syncable-entity-types-and-constants`
- `syncable-entity-cache-and-transform`
- `syncable-entity-builder-and-validation`
- `syncable-entity-runner-and-actions`
- `syncable-entity-integration`
- `syncable-entity-testing`
