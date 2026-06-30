# IdeaFlow Customization Layer

## Purpose

The IdeaFlow Customization Layer keeps IdeaFlow-specific extensions in dedicated workspace packages instead of scattering changes across the Twenty core. This makes the fork easier to maintain, reduces merge friction with upstream Twenty, and keeps Stage-based work scoped and reversible.

## Workspace Packages

- `packages/ideaflow-branding` stores product, company, domain, and workspace naming constants.
- `packages/ideaflow-theme` stores base theme tokens that later stages can apply to UI work.
- `packages/ideaflow-telegram` is the reserved integration package for Telegram-specific features.
- `packages/ideaflow-projects` is the reserved package for project-management functionality.
- `packages/ideaflow-documents` is the reserved package for document-related workflows.
- `packages/ideaflow-ai` is the reserved package for AI-facing integrations and adapters.

## What Can Change Here

- Branding constants and presentation-layer metadata.
- Theme tokens and visual customization inputs.
- Integration adapters that can be consumed by Twenty without rewriting its core packages.
- IdeaFlow-specific feature modules that stay isolated behind explicit imports.
- Documentation for the customization strategy and staged rollout.

## What Must Not Change Here

- Twenty business logic.
- Prisma schema, database structure, or migrations.
- GraphQL, REST, or internal API contracts.
- Authentication, permissions, sessions, or security gates.
- Existing runtime, worker, or build behavior unless a future approved stage explicitly requires it.

## Why This Protects Upstream Compatibility

By keeping IdeaFlow work in separate workspace packages, the fork can layer customization on top of Twenty instead of patching the same core files repeatedly. That lowers the risk of merge conflicts, keeps upstream updates easier to absorb, and makes it clearer which code is IdeaFlow-owned versus Twenty-owned.

## Stage 0 Status

Stage 0 creates the package boundaries only. The new packages are registered as Yarn workspaces, but they do not change runtime wiring, database behavior, API behavior, or authentication flow.

## Roadmap

1. Stage 1 Branding
2. Stage 2 Default Dark Theme
3. Stage 3 Telegram
4. Stage 4 Projects
5. Stage 5 Documents
6. Stage 6 AI Command Center Connector
