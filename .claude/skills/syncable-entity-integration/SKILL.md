---
name: syncable-entity-integration
description: Contributing to the Twenty codebase itself (twentyhq/twenty server internals), not for building apps on top of Twenty. Wire syncable entity services into NestJS modules, create service layer and resolvers for Twenty entities. Use when registering builders, validators, and action handlers in modules, creating business services, or exposing entities via GraphQL API with proper exception handling.
---

# Syncable Entity: Integration (Step 5/6)

**Purpose**: Wire everything together, register in modules, create services and resolvers.

**When to use**: After completing Steps 1-4 (all previous steps). Required before testing.

---

## Quick Start

This step:
1. Registers services in 3 NestJS modules
2. Creates service layer (returns flat entities)
3. Creates resolver layer (converts flat → DTO)
4. Relies on the global exception filters for GraphQL and REST errors

**Key principle**: Services return flat entities, resolvers transpile flat → DTO.

---

## Step 1: Register in Builder Module

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-builder/workspace-migration-builder.module.ts`

```typescript
import { WorkspaceMigrationMyEntityActionsBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/my-entity/workspace-migration-my-entity-actions-builder.service';

@Module({
  imports: [
    // ... existing imports
  ],
  providers: [
    // ... existing providers
    WorkspaceMigrationMyEntityActionsBuilderService,
  ],
  exports: [
    // ... existing exports
    WorkspaceMigrationMyEntityActionsBuilderService,
  ],
})
export class WorkspaceMigrationBuilderModule {}
```

**Important**: Add to both `providers` AND `exports` (builder needs to be exported for orchestrator).

---

## Step 2: Register in Validators Module

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/workspace-migration-builder-validators.module.ts`

```typescript
import { FlatMyEntityValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-my-entity-validator.service';

@Module({
  imports: [
    // ... existing imports
  ],
  providers: [
    // ... existing providers
    FlatMyEntityValidatorService,
  ],
  exports: [
    // ... existing exports
    FlatMyEntityValidatorService,
  ],
})
export class WorkspaceMigrationBuilderValidatorsModule {}
```

---

## Step 3: Register Action Handlers

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module.ts`

```typescript
import { CreateMyEntityActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/services/create-my-entity-action-handler.service';
import { UpdateMyEntityActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/services/update-my-entity-action-handler.service';
import { DeleteMyEntityActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/services/delete-my-entity-action-handler.service';

@Module({
  imports: [
    // ... existing imports
  ],
  providers: [
    // ... existing providers
    CreateMyEntityActionHandlerService,
    UpdateMyEntityActionHandlerService,
    DeleteMyEntityActionHandlerService,
  ],
  exports: [
    // ... existing exports (action handlers typically not exported)
  ],
})
export class WorkspaceSchemaMigrationRunnerActionHandlersModule {}
```

**Note**: Action handlers are typically only in `providers`, not `exports`.

---

## Step 4: Create Service Layer

**File**: `src/engine/metadata-modules/my-entity/my-entity.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';

import { type FlatMyEntity } from 'src/engine/metadata-modules/flat-my-entity/types/flat-my-entity.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateMyEntityInputToUniversalFlatMyEntity } from 'src/engine/metadata-modules/flat-my-entity/utils/from-create-my-entity-input-to-universal-flat-my-entity.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class MyEntityService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async create(input: CreateMyEntityInput, workspaceId: string): Promise<FlatMyEntity> {
    // 1. Transform input to universal flat entity
    const universalFlatMyEntityToCreate = fromCreateMyEntityInputToUniversalFlatMyEntity({
      input,
      workspaceId,
    });

    // 2. Validate, build, and run
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            myEntity: {
              flatEntityToCreate: [universalFlatMyEntityToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    // 3. Throw if validation failed
    if (isDefined(result)) {
      throw new WorkspaceMigrationBuilderException(
        result,
        'Validation errors occurred while creating entity',
      );
    }

    // 4. Return freshly cached flat entity
    const { flatMyEntityMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatMyEntityMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: universalFlatMyEntityToCreate.id,
      flatEntityMaps: flatMyEntityMaps,
    });
  }
}
```

**Service pattern**:
1. Transform input → universal flat entity
2. Call `validateBuildAndRunWorkspaceMigration`
3. Throw if validation errors
4. **Return flat entity** (not DTO)

---

## Step 5: Create Resolver Layer

**File**: `src/engine/metadata-modules/my-entity/my-entity.resolver.ts`

```typescript
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { MyEntityService } from 'src/engine/metadata-modules/my-entity/my-entity.service';
import { fromFlatMyEntityToMyEntityDto } from 'src/engine/metadata-modules/my-entity/utils/from-flat-my-entity-to-my-entity-dto.util';

@Resolver(() => MyEntityDto)
export class MyEntityResolver {
  constructor(private readonly myEntityService: MyEntityService) {}

  @Mutation(() => MyEntityDto)
  async createMyEntity(
    @Args('input') input: CreateMyEntityInput,
    @Workspace() { id: workspaceId }: Workspace,
  ): Promise<MyEntityDto> {
    // Service returns flat entity
    const flatMyEntity = await this.myEntityService.create(input, workspaceId);
    
    // Resolver converts flat entity to DTO
    return fromFlatMyEntityToMyEntityDto(flatMyEntity);
  }

  @Mutation(() => MyEntityDto)
  async updateMyEntity(
    @Args('id') id: string,
    @Args('input') input: UpdateMyEntityInput,
    @Workspace() { id: workspaceId }: Workspace,
  ): Promise<MyEntityDto> {
    const flatMyEntity = await this.myEntityService.update(id, input, workspaceId);
    return fromFlatMyEntityToMyEntityDto(flatMyEntity);
  }

  @Mutation(() => Boolean)
  async deleteMyEntity(
    @Args('id') id: string,
    @Workspace() { id: workspaceId }: Workspace,
  ) {
    await this.myEntityService.delete(id, workspaceId);
    return true;
  }
}
```

**Resolver responsibilities**:
- Receives flat entities from service
- **Converts flat → DTO** using conversion utility
- Returns DTOs to GraphQL API
- Lets exceptions propagate: global filters format them

---

## Step 6: Flat-to-DTO Conversion

**File**: `src/engine/metadata-modules/my-entity/utils/from-flat-my-entity-to-my-entity-dto.util.ts`

```typescript
import { type FlatMyEntity } from 'src/engine/metadata-modules/flat-my-entity/types/flat-my-entity.type';
import { type MyEntityDto } from 'src/engine/metadata-modules/my-entity/dtos/my-entity.dto';

export const fromFlatMyEntityToMyEntityDto = (
  flatMyEntity: FlatMyEntity,
): MyEntityDto => {
  return {
    id: flatMyEntity.id,
    name: flatMyEntity.name,
    label: flatMyEntity.label,
    description: flatMyEntity.description,
    isCustom: flatMyEntity.isCustom,
    createdAt: flatMyEntity.createdAt,
    updatedAt: flatMyEntity.updatedAt,
    // Convert foreign key IDs to relation objects if needed
    // parentEntity: flatMyEntity.parentEntityId ? { id: flatMyEntity.parentEntityId } : null,
  };
};
```

---

## Layer Responsibilities

| Layer | Input | Output | Responsibility |
|-------|-------|--------|----------------|
| **Service** | Input DTO | Flat Entity | Business logic, validation orchestration |
| **Resolver** | Service result | DTO | Flat → DTO conversion, GraphQL exposure |

**Service Layer**:
- Works with flat entities internally
- Returns `FlatMyEntity` type
- No knowledge of DTOs or GraphQL types

**Resolver Layer**:
- Receives flat entities from service
- Converts flat entities to DTOs
- Returns DTOs to GraphQL API

---

## Exceptions

Resolvers and controllers need no exception filter or interceptor for standard exceptions. Keep a dedicated filter only when the response itself is special (the OAuth redirect on `OAUTH_ACCESS_DENIED`, the `Content-Range` header on file range errors):

1. `CustomException` subclasses (e.g. `FlatEntityMapsException`) → `CustomExceptionFilter` and the GraphQL error hook turn each code's category into a REST status or a GraphQL error
2. `WorkspaceMigrationBuilderException` / `WorkspaceMigrationRunnerException` → `WorkspaceMigrationExceptionFilter` formats validation and runner errors with i18n

A new exception declares a category for every code, next to its user-friendly messages:

```typescript
const MY_ENTITY_EXCEPTION_CATEGORY_BY_CODE = {
  [MyEntityExceptionCode.MY_ENTITY_NOT_FOUND]: 'NOT_FOUND',
  [MyEntityExceptionCode.INVALID_MY_ENTITY_INPUT]: 'BAD_USER_INPUT',
} as const satisfies Record<MyEntityExceptionCode, ExceptionCategory>;

// in the constructor
super(message, code, {
  userFriendlyMessage: getMyEntityExceptionUserFriendlyMessage(code),
  category: MY_ENTITY_EXCEPTION_CATEGORY_BY_CODE[code],
});
```

---

## Checklist

Before moving to Step 6 (Testing):

- [ ] Builder registered in builder module (providers + exports)
- [ ] Validator registered in validators module (providers + exports)
- [ ] All 3 action handlers registered in action handlers module (providers)
- [ ] Service layer created
- [ ] Service returns flat entities (not DTOs)
- [ ] Resolver layer created
- [ ] Exception declares a category for every code
- [ ] Resolver converts flat → DTO
- [ ] Flat-to-DTO conversion utility created

---

## Next Step

Once integration is complete, proceed to (**MANDATORY**):
**[Syncable Entity: Integration Testing (Step 6/6)](../syncable-entity-testing/SKILL.md)**

For complete workflow, see `@creating-syncable-entity` rule.
