---
name: syncable-entity-runner-and-actions
description: Implement action handlers for executing workspace migrations in Twenty. Use when creating database operations for syncable entities, implementing universal-to-flat entity transpilation, or handling create/update/delete actions in the runner layer.
---

# Syncable Entity: Runner & Actions (Step 4/6)

**Purpose**: Execute migration actions against the database with proper transpilation from universal to flat entities.

**When to use**: After completing Steps 1-3 (Types, Cache, Builder). Required before integration.

---

## Quick Start

This step creates:
1. Create action handler
2. Update action handler
3. Delete action handler
4. Universal-to-flat conversion utilities

**Key pattern**: Each handler has two phases:
1. **Transpilation**: Universal action → Flat action
2. **Execution**: Flat action → Database operation

---

## Step 1: Create Action Handler

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/services/create-my-entity-action-handler.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkspaceCreateActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-create-action-handler.service';
import { MyEntityEntity } from 'src/engine/metadata-modules/my-entity/entities/my-entity.entity';
import { fromUniversalFlatMyEntityToFlatMyEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/utils/from-universal-flat-my-entity-to-flat-my-entity.util';
import {
  type UniversalCreateMyEntityAction,
  type FlatCreateMyEntityAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/my-entity/types/workspace-migration-my-entity-action.type';

@Injectable()
export class CreateMyEntityActionHandlerService extends WorkspaceCreateActionHandlerService<
  'myEntity',
  UniversalCreateMyEntityAction,
  FlatCreateMyEntityAction
> {
  constructor(
    @InjectRepository(MyEntityEntity, 'metadata')
    private readonly myEntityRepository: Repository<MyEntityEntity>,
  ) {
    super();
  }

  // Phase 1: Transpile universal action to flat action
  protected transpileUniversalActionToFlatAction(
    universalAction: UniversalCreateMyEntityAction,
    flatEntityMaps: AllFlatEntityMapsByMetadataName,
  ): FlatCreateMyEntityAction {
    return {
      type: 'create',
      metadataName: 'myEntity',
      flatEntity: fromUniversalFlatMyEntityToFlatMyEntity(
        universalAction.universalFlatEntity,
        flatEntityMaps,
      ),
    };
  }

  // Phase 2: Execute flat action against database
  protected async executeForMetadata(
    flatActions: FlatCreateMyEntityAction[],
  ): Promise<void> {
    const flatEntities = flatActions.map((action) => action.flatEntity);

    await this.insertFlatEntitiesInRepository({
      repository: this.myEntityRepository,
      flatEntities,
    });
  }

  protected async executeForWorkspaceSchema(): Promise<void> {
    // No workspace schema changes needed for metadata-only entity
    return;
  }
}
```

**Key helper methods**:
- `transpileUniversalActionToFlatAction`: Converts universal → flat
- `insertFlatEntitiesInRepository`: Base class helper for inserts
- `executeForMetadata`: Metadata database operations
- `executeForWorkspaceSchema`: Workspace schema changes (if needed)

---

## Step 2: Update Action Handler

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/services/update-my-entity-action-handler.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkspaceUpdateActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-update-action-handler.service';
import { MyEntityEntity } from 'src/engine/metadata-modules/my-entity/entities/my-entity.entity';
import { fromUniversalFlatMyEntityToFlatMyEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/utils/from-universal-flat-my-entity-to-flat-my-entity.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';

@Injectable()
export class UpdateMyEntityActionHandlerService extends WorkspaceUpdateActionHandlerService<
  'myEntity',
  UniversalUpdateMyEntityAction,
  FlatUpdateMyEntityAction
> {
  constructor(
    @InjectRepository(MyEntityEntity, 'metadata')
    private readonly myEntityRepository: Repository<MyEntityEntity>,
  ) {
    super();
  }

  protected transpileUniversalActionToFlatAction(
    universalAction: UniversalUpdateMyEntityAction,
    flatEntityMaps: AllFlatEntityMapsByMetadataName,
  ): FlatUpdateMyEntityAction {
    const flatEntity = fromUniversalFlatMyEntityToFlatMyEntity(
      universalAction.universalFlatEntity,
      flatEntityMaps,
    );

    // Resolve universal foreign keys in updates to regular IDs
    const flatUpdates = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'myEntity',
      universalUpdates: universalAction.universalUpdates,
      flatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'myEntity',
      flatEntity,
      updates: flatUpdates,
    };
  }

  protected async executeForMetadata(
    flatActions: FlatUpdateMyEntityAction[],
  ): Promise<void> {
    for (const action of flatActions) {
      await this.myEntityRepository.update(
        { id: action.flatEntity.id },
        action.updates,
      );
    }
  }

  protected async executeForWorkspaceSchema(): Promise<void> {
    return;
  }
}
```

**Update-specific helper**:
- `resolveUniversalUpdateRelationIdentifiersToIds`: Maps universal identifiers back to regular IDs in the updates object

---

## Step 3: Delete Action Handler

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/services/delete-my-entity-action-handler.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkspaceDeleteActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-delete-action-handler.service';
import { MyEntityEntity } from 'src/engine/metadata-modules/my-entity/entities/my-entity.entity';
import { fromUniversalFlatMyEntityToFlatMyEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/utils/from-universal-flat-my-entity-to-flat-my-entity.util';

@Injectable()
export class DeleteMyEntityActionHandlerService extends WorkspaceDeleteActionHandlerService<
  'myEntity',
  UniversalDeleteMyEntityAction,
  FlatDeleteMyEntityAction
> {
  constructor(
    @InjectRepository(MyEntityEntity, 'metadata')
    private readonly myEntityRepository: Repository<MyEntityEntity>,
  ) {
    super();
  }

  protected transpileUniversalActionToFlatAction(
    universalAction: UniversalDeleteMyEntityAction,
    flatEntityMaps: AllFlatEntityMapsByMetadataName,
  ): FlatDeleteMyEntityAction {
    // Use base class helper for delete transpilation
    return this.transpileUniversalDeleteActionToFlatDeleteAction({
      universalAction,
      flatEntityMaps,
      fromUniversalFlatEntityToFlatEntity: fromUniversalFlatMyEntityToFlatMyEntity,
    });
  }

  protected async executeForMetadata(
    flatActions: FlatDeleteMyEntityAction[],
  ): Promise<void> {
    const ids = flatActions.map((action) => action.flatEntity.id);

    await this.myEntityRepository.delete(ids);
  }

  protected async executeForWorkspaceSchema(): Promise<void> {
    return;
  }
}
```

**Delete-specific helper**:
- `transpileUniversalDeleteActionToFlatDeleteAction`: Base class helper that handles standard delete transpilation

---

## Step 4: Universal-to-Flat Conversion

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/my-entity/utils/from-universal-flat-my-entity-to-flat-my-entity.util.ts`

```typescript
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import { type UniversalFlatMyEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-my-entity.type';
import { type FlatMyEntity } from 'src/engine/metadata-modules/flat-my-entity/types/flat-my-entity.type';
import { type AllFlatEntityMapsByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps-by-metadata-name.type';

export const fromUniversalFlatMyEntityToFlatMyEntity = (
  universalFlatMyEntity: UniversalFlatMyEntity,
  flatEntityMaps: AllFlatEntityMapsByMetadataName,
): FlatMyEntity => {
  // Resolve universal foreign keys back to regular IDs
  return resolveUniversalRelationIdentifiersToIds({
    metadataName: 'myEntity',
    universalFlatEntity: universalFlatMyEntity,
    flatEntityMaps,
  }) as FlatMyEntity;
};
```

**Key utility**:
- `resolveUniversalRelationIdentifiersToIds`: Maps universal identifiers → regular IDs (reverse of `resolveEntityRelationUniversalIdentifiers`)

---

## Action Handler Patterns

### Pattern: Create Handler
```typescript
// 1. Transpile: Universal → Flat
protected transpileUniversalActionToFlatAction(
  universalAction,
  flatEntityMaps,
) {
  return {
    type: 'create',
    metadataName: 'myEntity',
    flatEntity: fromUniversalFlatMyEntityToFlatMyEntity(
      universalAction.universalFlatEntity,
      flatEntityMaps,
    ),
  };
}

// 2. Execute: Flat → Database
protected async executeForMetadata(flatActions) {
  await this.insertFlatEntitiesInRepository({
    repository: this.myEntityRepository,
    flatEntities: flatActions.map(a => a.flatEntity),
  });
}
```

### Pattern: Update Handler
```typescript
// Transpile with update-specific resolution
protected transpileUniversalActionToFlatAction(
  universalAction,
  flatEntityMaps,
) {
  const flatEntity = fromUniversalFlatMyEntityToFlatMyEntity(
    universalAction.universalFlatEntity,
    flatEntityMaps,
  );

  const flatUpdates = resolveUniversalUpdateRelationIdentifiersToIds({
    metadataName: 'myEntity',
    universalUpdates: universalAction.universalUpdates,
    flatEntityMaps,
  });

  return { type: 'update', metadataName: 'myEntity', flatEntity, updates: flatUpdates };
}
```

### Pattern: Delete Handler
```typescript
// Use base class helper
protected transpileUniversalActionToFlatAction(
  universalAction,
  flatEntityMaps,
) {
  return this.transpileUniversalDeleteActionToFlatDeleteAction({
    universalAction,
    flatEntityMaps,
    fromUniversalFlatEntityToFlatEntity: fromUniversalFlatMyEntityToFlatMyEntity,
  });
}

// Delete
protected async executeForMetadata(flatActions) {
  const ids = flatActions.map(a => a.flatEntity.id);
  await this.myEntityRepository.delete(ids);
}
```

---

## Checklist

Before moving to Step 5:

- [ ] Create action handler implemented
- [ ] Update action handler implemented
- [ ] Delete action handler implemented
- [ ] All handlers extend appropriate base class
- [ ] `transpileUniversalActionToFlatAction` implemented in all handlers
- [ ] `executeForMetadata` implemented in all handlers
- [ ] `executeForWorkspaceSchema` implemented (or returns empty)
- [ ] Universal-to-flat conversion utility created
- [ ] Create handler uses `insertFlatEntitiesInRepository`
- [ ] Update handler uses `resolveUniversalUpdateRelationIdentifiersToIds`
- [ ] Delete handler uses `transpileUniversalDeleteActionToFlatDeleteAction`
- [ ] Delete handler uses hard delete (`delete()`)

---

## Next Step

Once action handlers are complete, proceed to:
**[Syncable Entity: Integration (Step 5/6)](../syncable-entity-integration/SKILL.md)**

For complete workflow, see `@creating-syncable-entity` rule.
