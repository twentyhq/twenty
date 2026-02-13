# Syncable Entity Skills

This directory contains Cursor Skills for creating syncable entities in Twenty's workspace migration system. These skills guide you step-by-step through the entire process of implementing a new syncable entity.

## What are Syncable Entities?

Syncable entities are metadata entities that:
- Have a `universalIdentifier` for cross-workspace syncing
- Have an `applicationId` linking to applications
- Participate in the workspace migration system
- Are cached as flat entities for efficient validation

Examples: `skill`, `agent`, `view`, `viewField`, `role`, `pageLayout`, etc.

## Skills Overview

Follow these skills in order when creating a new syncable entity:

### 1. `@syncable-entity-types-and-constants`
**Foundation: Types & Constants (Step 1/6)**

Define all types, entities, and register in central constants. This is the foundation - everything else depends on these types.

**Creates:**
- Metadata name constant (twenty-shared)
- TypeORM entity (extends `SyncableEntity`)
- Flat entity types
- Action types (universal + flat)
- 4 central constant registrations

**Use when:** Starting a new syncable entity, defining types, or registering in central constants.

---

### 2. `@syncable-entity-cache-and-transform`
**Data Layer: Cache & Transform (Step 2/6)**

Create cache layer and transformation utilities to convert between different entity representations.

**Creates:**
- Cache service for flat entity maps
- Entity-to-flat conversion utility
- Input transform utils (DTO → Universal Flat Entity)

**Use when:** Implementing caching, entity conversions, or input transpilation.

---

### 3. `@syncable-entity-builder-and-validation`
**Business Logic: Builder & Validation (Step 3/6)**

Implement business rule validation and create migration action builders.

**Creates:**
- Validator service (never throws, never mutates)
- Builder service (creates migration actions)
- Orchestrator wiring (**CRITICAL** - often forgotten!)

**Use when:** Implementing validation logic, uniqueness checks, or building migration actions.

---

### 4. `@syncable-entity-runner-and-actions`
**Execution: Runner & Actions (Step 4/6)**

Execute migration actions against the database with proper transpilation.

**Creates:**
- Create action handler
- Update action handler
- Delete action handler
- Universal-to-flat conversion utilities

**Use when:** Implementing database operations for create/update/delete actions.

---

### 5. `@syncable-entity-integration`
**Assembly: Integration (Step 5/6)**

Wire everything together, register in modules, create services and resolvers.

**Creates:**
- Module registrations (3 modules)
- Service layer (returns flat entities)
- Resolver layer (converts flat → DTO)
- Exception interceptor setup

**Use when:** Registering services in modules, creating business services, or exposing entities via GraphQL.

---

### 6. `@syncable-entity-testing` ⚠️ **MANDATORY**
**Testing: Integration Tests (Step 6/6)**

Create comprehensive test suite covering all scenarios.

**Creates:**
- Test utilities (query factories + wrappers)
- Failing tests (all validator exceptions)
- Successful tests (all CRUD operations)
- Edge case tests

**Use when:** Writing integration tests for syncable entities. **Tests are REQUIRED for all entities.**

---

## Quick Start

To create a new syncable entity, reference the skills in order:

1. **`@syncable-entity-types-and-constants`** - Define types and register in constants
2. **`@syncable-entity-cache-and-transform`** - Create cache and transform utilities
3. **`@syncable-entity-builder-and-validation`** - Implement validation and builder
4. **`@syncable-entity-runner-and-actions`** - Create action handlers
5. **`@syncable-entity-integration`** - Wire modules and create services
6. **`@syncable-entity-testing`** - Write comprehensive tests (**MANDATORY**)

## Key Principles

| Layer | Responsibility | Can Throw? | Can Mutate? |
|-------|---------------|------------|-------------|
| Transform Utils | Data transformation | Yes (input validation) | N/A (creates new) |
| Validator | Business rule validation | **No** (returns errors) | **No** |
| Builder | Action creation | **No** (returns errors) | **No** |
| Runner | Database operations | Yes (DB errors) | Yes (via TypeORM) |

## Common Pitfalls

⚠️ **Most Commonly Forgotten:**
1. Wiring builder in orchestrator service
2. Registering in all 3 modules (builder, validators, action handlers)
3. Setting `universalIdentifier` correctly (must be `v4()`, not `entity.id`)

⚠️ **Common Mistakes:**
1. Using regular IDs instead of universal identifiers in transform utils
2. Throwing exceptions in validators/builders
3. Mutating entity maps in validators/builders
4. Using `Object.values().find()` instead of indexed maps (O(n) vs O(1))
5. Forgetting to handle JSONB properties with `SerializedRelation`

## How Skills Work

Skills are automatically available when you work on relevant files. You can also manually reference them using the `@` syntax:

```
@syncable-entity-types-and-constants
@syncable-entity-cache-and-transform
@syncable-entity-builder-and-validation
@syncable-entity-runner-and-actions
@syncable-entity-integration
@syncable-entity-testing
```

The agent will automatically read and apply the skill when it's relevant to your task.

## Related Documentation

For the complete master guide and detailed documentation, see:
- **Master Guide**: `.cursor/rules/creating-syncable-entity.mdc`
- **Detailed Rules**: `.cursor/rules/syncable-entity-*.mdc` files

## File Locations

```
packages/twenty-shared/src/metadata/
└── all-metadata-name.constant.ts

packages/twenty-server/src/engine/metadata-modules/
├── my-entity/                           # Step 1
│   └── entities/
├── flat-my-entity/                      # Steps 1-2
│   ├── types/
│   ├── constants/
│   ├── services/
│   └── utils/
└── flat-entity/constant/                # Step 1 (central registries)

packages/twenty-server/src/engine/workspace-manager/workspace-migration/
├── universal-flat-entity/constants/     # Step 1
├── workspace-migration-builder/         # Step 3
│   ├── builders/my-entity/
│   └── validators/services/
└── workspace-migration-runner/          # Step 4
    └── action-handlers/my-entity/

test/integration/metadata/suites/        # Step 6
└── my-entity/
    ├── failing-*.integration-spec.ts
    ├── successful-*.integration-spec.ts
    └── utils/
```

---

**For support or questions about creating syncable entities, reference the appropriate skill or the master guide.**
