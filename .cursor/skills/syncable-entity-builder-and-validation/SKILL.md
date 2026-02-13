---
name: syncable-entity-builder-and-validation
description: Create validation logic and migration action builders for syncable entities in Twenty. Use when implementing business rule validation, uniqueness checks, foreign key validation, or building workspace migration actions for syncable entities. Validators never throw and never mutate.
---

# Syncable Entity: Builder & Validation (Step 3/6)

**Purpose**: Implement business rule validation and create migration action builders.

**When to use**: After completing Steps 1-2 (Types, Cache, Transform). Required before implementing action handlers.

---

## Quick Start

This step creates:
1. Validator service (business logic validation)
2. Builder service (action creation)
3. Orchestrator wiring (**CRITICAL** - often forgotten!)

**Key principles**:
- Validators **never throw** - return error arrays
- Validators **never mutate** - pass optimistic entity maps
- Use indexed lookups (O(1)) not `Object.values().find()` (O(n))

---

## Step 1: Create Validator Service

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-my-entity-validator.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { t, msg } from '@lingui/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatMyEntity } from 'src/engine/metadata-modules/flat-my-entity/types/flat-my-entity.type';
import { type FlatMyEntityMaps } from 'src/engine/metadata-modules/flat-my-entity/types/flat-my-entity-maps.type';
import { WorkspaceMigrationValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/types/workspace-migration-validation-error.type';
import { MyEntityExceptionCode } from 'src/engine/metadata-modules/my-entity/exceptions/my-entity-exception-code.enum';

@Injectable()
export class FlatMyEntityValidatorService {
  validateMyEntityForCreate(
    flatMyEntity: FlatMyEntity,
    optimisticFlatMyEntityMaps: FlatMyEntityMaps,
  ): WorkspaceMigrationValidationError[] {
    const errors: WorkspaceMigrationValidationError[] = [];

    // Pattern 1: Required field validation
    if (!isDefined(flatMyEntity.name) || flatMyEntity.name.trim() === '') {
      errors.push({
        code: MyEntityExceptionCode.NAME_REQUIRED,
        message: t`Name is required`,
        userFriendlyMessage: msg`Please provide a name for this entity`,
      });
    }

    // Pattern 2: Uniqueness check - use indexed map (O(1))
    const existingEntityWithName = optimisticFlatMyEntityMaps.byName[flatMyEntity.name];

    if (isDefined(existingEntityWithName) && existingEntityWithName.id !== flatMyEntity.id) {
      errors.push({
        code: MyEntityExceptionCode.MY_ENTITY_ALREADY_EXISTS,
        message: t`Entity with name ${flatMyEntity.name} already exists`,
        userFriendlyMessage: msg`An entity with this name already exists`,
      });
    }

    // Pattern 3: Foreign key validation
    if (isDefined(flatMyEntity.parentEntityId)) {
      const parentEntity = optimisticFlatParentEntityMaps.byId[flatMyEntity.parentEntityId];

      if (!isDefined(parentEntity)) {
        errors.push({
          code: MyEntityExceptionCode.PARENT_ENTITY_NOT_FOUND,
          message: t`Parent entity with ID ${flatMyEntity.parentEntityId} not found`,
          userFriendlyMessage: msg`The specified parent entity does not exist`,
        });
      } else if (isDefined(parentEntity.deletedAt)) {
        errors.push({
          code: MyEntityExceptionCode.PARENT_ENTITY_DELETED,
          message: t`Parent entity is deleted`,
          userFriendlyMessage: msg`Cannot reference a deleted parent entity`,
        });
      }
    }

    // Pattern 4: Standard entity protection
    if (flatMyEntity.isCustom === false) {
      errors.push({
        code: MyEntityExceptionCode.STANDARD_ENTITY_CANNOT_BE_CREATED,
        message: t`Cannot create standard entity`,
        userFriendlyMessage: msg`Standard entities can only be created by the system`,
      });
    }

    return errors;
  }

  validateMyEntityForUpdate(
    flatMyEntity: FlatMyEntity,
    updates: Partial<FlatMyEntity>,
    optimisticFlatMyEntityMaps: FlatMyEntityMaps,
  ): WorkspaceMigrationValidationError[] {
    const errors: WorkspaceMigrationValidationError[] = [];

    // Standard entity protection
    if (flatMyEntity.isCustom === false) {
      errors.push({
        code: MyEntityExceptionCode.STANDARD_ENTITY_CANNOT_BE_UPDATED,
        message: t`Cannot update standard entity`,
        userFriendlyMessage: msg`Standard entities cannot be modified`,
      });
      return errors; // Early return if standard
    }

    // Uniqueness check for name changes
    if (isDefined(updates.name) && updates.name !== flatMyEntity.name) {
      const existingEntityWithName = optimisticFlatMyEntityMaps.byName[updates.name];

      if (isDefined(existingEntityWithName) && existingEntityWithName.id !== flatMyEntity.id) {
        errors.push({
          code: MyEntityExceptionCode.MY_ENTITY_ALREADY_EXISTS,
          message: t`Entity with name ${updates.name} already exists`,
          userFriendlyMessage: msg`An entity with this name already exists`,
        });
      }
    }

    return errors;
  }

  validateMyEntityForDelete(
    flatMyEntity: FlatMyEntity,
  ): WorkspaceMigrationValidationError[] {
    const errors: WorkspaceMigrationValidationError[] = [];

    // Standard entity protection
    if (flatMyEntity.isCustom === false) {
      errors.push({
        code: MyEntityExceptionCode.STANDARD_ENTITY_CANNOT_BE_DELETED,
        message: t`Cannot delete standard entity`,
        userFriendlyMessage: msg`Standard entities cannot be deleted`,
      });
    }

    return errors;
  }
}
```

**Performance warning**: Avoid `Object.values().find()` - use indexed maps instead!

```typescript
// ❌ BAD: O(n) - slow for large datasets
const duplicate = Object.values(optimisticFlatMyEntityMaps.byId).find(
  (entity) => entity.name === flatMyEntity.name && entity.id !== flatMyEntity.id
);

// ✅ GOOD: O(1) - use indexed map
const existingEntityWithName = optimisticFlatMyEntityMaps.byName[flatMyEntity.name];
if (isDefined(existingEntityWithName) && existingEntityWithName.id !== flatMyEntity.id) {
  // Handle duplicate
}
```

---

## Step 2: Create Builder Service

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/my-entity/workspace-migration-my-entity-actions-builder.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/workspace-entity-migration-builder.service';
import { FlatMyEntityValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-my-entity-validator.service';
import { type UniversalFlatMyEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-my-entity.type';
import {
  type UniversalCreateMyEntityAction,
  type UniversalUpdateMyEntityAction,
  type UniversalDeleteMyEntityAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/my-entity/types/workspace-migration-my-entity-action.type';

@Injectable()
export class WorkspaceMigrationMyEntityActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  'myEntity',
  UniversalFlatMyEntity,
  UniversalCreateMyEntityAction,
  UniversalUpdateMyEntityAction,
  UniversalDeleteMyEntityAction
> {
  constructor(
    private readonly flatMyEntityValidatorService: FlatMyEntityValidatorService,
  ) {
    super();
  }

  protected buildCreateAction(
    universalFlatMyEntity: UniversalFlatMyEntity,
    flatEntityMaps: AllFlatEntityMapsByMetadataName,
  ): BuildWorkspaceMigrationActionReturnType<UniversalCreateMyEntityAction> {
    const validationResult = this.flatMyEntityValidatorService.validateMyEntityForCreate(
      universalFlatMyEntity,
      flatEntityMaps.flatMyEntityMaps,
    );

    if (validationResult.length > 0) {
      return {
        status: 'failed',
        errors: validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'myEntity',
        universalFlatEntity: universalFlatMyEntity,
      },
    };
  }

  protected buildUpdateAction(
    universalFlatMyEntity: UniversalFlatMyEntity,
    universalUpdates: Partial<UniversalFlatMyEntity>,
    flatEntityMaps: AllFlatEntityMapsByMetadataName,
  ): BuildWorkspaceMigrationActionReturnType<UniversalUpdateMyEntityAction> {
    const validationResult = this.flatMyEntityValidatorService.validateMyEntityForUpdate(
      universalFlatMyEntity,
      universalUpdates,
      flatEntityMaps.flatMyEntityMaps,
    );

    if (validationResult.length > 0) {
      return {
        status: 'failed',
        errors: validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'update',
        metadataName: 'myEntity',
        universalFlatEntity: universalFlatMyEntity,
        universalUpdates,
      },
    };
  }

  protected buildDeleteAction(
    universalFlatMyEntity: UniversalFlatMyEntity,
  ): BuildWorkspaceMigrationActionReturnType<UniversalDeleteMyEntityAction> {
    const validationResult = this.flatMyEntityValidatorService.validateMyEntityForDelete(
      universalFlatMyEntity,
    );

    if (validationResult.length > 0) {
      return {
        status: 'failed',
        errors: validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'myEntity',
        universalFlatEntity: universalFlatMyEntity,
      },
    };
  }
}
```

---

## Step 3: Wire into Orchestrator (**CRITICAL**)

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-builder/workspace-migration-build-orchestrator.service.ts`

```typescript
@Injectable()
export class WorkspaceMigrationBuildOrchestratorService {
  constructor(
    // ... existing builders
    private readonly workspaceMigrationMyEntityActionsBuilderService: WorkspaceMigrationMyEntityActionsBuilderService,
  ) {}

  async buildWorkspaceMigration({
    allFlatEntityOperationByMetadataName,
    flatEntityMaps,
    isSystemBuild,
  }: BuildWorkspaceMigrationInput): Promise<BuildWorkspaceMigrationOutput> {
    // ... existing code

    // Add your entity builder
    const myEntityResult = await this.workspaceMigrationMyEntityActionsBuilderService.build({
      flatEntitiesToCreate: allFlatEntityOperationByMetadataName.myEntity?.flatEntityToCreate ?? [],
      flatEntitiesToUpdate: allFlatEntityOperationByMetadataName.myEntity?.flatEntityToUpdate ?? [],
      flatEntitiesToDelete: allFlatEntityOperationByMetadataName.myEntity?.flatEntityToDelete ?? [],
      flatEntityMaps,
      isSystemBuild,
    });

    // ... aggregate errors

    return {
      status: aggregatedErrors.length > 0 ? 'failed' : 'success',
      errors: aggregatedErrors,
      actions: [
        ...existingActions,
        ...myEntityResult.actions,
      ],
    };
  }
}
```

**⚠️ This step is the most commonly forgotten!** Your entity won't sync without orchestrator wiring.

---

## Validation Patterns

### Pattern 1: Required Field
```typescript
if (!isDefined(field) || field.trim() === '') {
  errors.push({ code: ..., message: ..., userFriendlyMessage: ... });
}
```

### Pattern 2: Uniqueness (O(1) lookup)
```typescript
const existing = optimisticMaps.byName[entity.name];
if (isDefined(existing) && existing.id !== entity.id) {
  errors.push({ ... });
}
```

### Pattern 3: Foreign Key Validation
```typescript
if (isDefined(entity.parentId)) {
  const parent = parentMaps.byId[entity.parentId];
  if (!isDefined(parent)) {
    errors.push({ code: NOT_FOUND, ... });
  } else if (isDefined(parent.deletedAt)) {
    errors.push({ code: DELETED, ... });
  }
}
```

### Pattern 4: Standard Entity Protection
```typescript
if (entity.isCustom === false) {
  errors.push({ code: STANDARD_ENTITY_PROTECTED, ... });
  return errors; // Early return
}
```

---

## Checklist

Before moving to Step 4:

- [ ] Validator service created
- [ ] Validator **never throws** (returns error arrays)
- [ ] Validator **never mutates** (uses optimistic maps)
- [ ] All uniqueness checks use indexed maps (O(1))
- [ ] Required field validation implemented
- [ ] Foreign key validation implemented
- [ ] Standard entity protection implemented
- [ ] Builder service extends `WorkspaceEntityMigrationBuilderService`
- [ ] Builder creates actions with universal entities
- [ ] **Builder wired into orchestrator** (**CRITICAL**)
- [ ] **Builder injected in orchestrator constructor**
- [ ] **Builder called in `buildWorkspaceMigration`**
- [ ] **Actions added to orchestrator return statement**

---

## Next Step

Once builder and validation are complete, proceed to:
**[Syncable Entity: Runner & Actions (Step 4/6)](../syncable-entity-runner-and-actions/SKILL.md)**

For complete workflow, see `@creating-syncable-entity` rule.
