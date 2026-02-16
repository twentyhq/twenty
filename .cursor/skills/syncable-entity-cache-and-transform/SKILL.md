---
name: syncable-entity-cache-and-transform
description: Create cache services and transformation utilities for syncable entities in Twenty. Use when implementing entity-to-flat conversions, input DTO transpilation to universal flat entities, or cache recomputation for syncable entities.
---

# Syncable Entity: Cache & Transform (Step 2/6)

**Purpose**: Create cache layer and transformation utilities to convert between different entity representations.

**When to use**: After completing Step 1 (Types & Constants). Required before building validators and action handlers.

---

## Quick Start

This step creates:
1. Cache service for flat entity maps
2. Entity-to-flat conversion utility
3. Input transform utils (DTO → Universal Flat Entity)

**Key principle**: Input transform utils must output **universal flat entities** (with `universalIdentifier` and foreign keys mapped to universal identifiers).

---

## Step 1: Create Cache Service

**File**: `src/engine/metadata-modules/flat-my-entity/services/flat-my-entity-cache.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { WorkspaceCache } from 'src/engine/twenty-orm/decorators/workspace-cache.decorator';
import { MyEntityEntity } from 'src/engine/metadata-modules/my-entity/entities/my-entity.entity';
import { type FlatMyEntityMaps } from 'src/engine/metadata-modules/flat-my-entity/types/flat-my-entity-maps.type';
import { fromMyEntityEntityToFlatMyEntity } from 'src/engine/metadata-modules/flat-my-entity/utils/from-my-entity-entity-to-flat-my-entity.util';

@Injectable()
export class FlatMyEntityCacheService {
  constructor(
    @InjectRepository(MyEntityEntity, 'metadata')
    private readonly myEntityRepository: Repository<MyEntityEntity>,
  ) {}

  @WorkspaceCache({ flatMapsKey: 'flatMyEntityMaps' })
  async getFlatMyEntityMaps(): Promise<FlatMyEntityMaps> {
    const myEntities = await this.myEntityRepository.find({
      withDeleted: true, // CRITICAL: Include soft-deleted entities
    });

    const flatMyEntities = myEntities.map((entity) =>
      fromMyEntityEntityToFlatMyEntity(entity),
    );

    return {
      byId: Object.fromEntries(flatMyEntities.map((e) => [e.id, e])),
      byName: Object.fromEntries(flatMyEntities.map((e) => [e.name, e])),
    };
  }
}
```

**Critical rules**:
- Use `@WorkspaceCache` decorator with unique `flatMapsKey`
- **Always** use `withDeleted: true` to include soft-deleted entities
- Cache key pattern: `flat{EntityName}Maps` (camelCase)

---

## Step 2: Entity-to-Flat Conversion

**File**: `src/engine/metadata-modules/flat-my-entity/utils/from-my-entity-entity-to-flat-my-entity.util.ts`

```typescript
import { v4 } from 'uuid';
import { type MyEntityEntity } from 'src/engine/metadata-modules/my-entity/entities/my-entity.entity';
import { type FlatMyEntity } from 'src/engine/metadata-modules/flat-my-entity/types/flat-my-entity.type';

export const fromMyEntityEntityToFlatMyEntity = (
  entity: MyEntityEntity,
): FlatMyEntity => {
  return {
    id: entity.id,
    // Critical: generate a new UUID for universalIdentifier
    universalIdentifier: v4(),
    workspaceId: entity.workspaceId,
    applicationId: entity.applicationId,
    name: entity.name,
    label: entity.label,
    description: entity.description,
    isCustom: entity.isCustom,
    parentEntityId: entity.parentEntityId,
    settings: entity.settings,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    deletedAt: entity.deletedAt?.toISOString() ?? null,
  };
};
```

**Critical**: `universalIdentifier` must be a new UUID generated with `v4()` (not `entity.id`)

---

## Step 3: Input Transform Utils (DTO → Universal Flat Entity)

**File**: `src/engine/metadata-modules/flat-my-entity/utils/from-create-my-entity-input-to-universal-flat-my-entity.util.ts`

```typescript
import { v4 } from 'uuid';
import { sanitizeString } from 'twenty-shared/string';
import { type CreateMyEntityInput } from 'src/engine/metadata-modules/my-entity/dtos/create-my-entity.input';
import { type UniversalFlatMyEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-my-entity.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type AllFlatEntityMapsByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps-by-metadata-name.type';

export const fromCreateMyEntityInputToUniversalFlatMyEntity = ({
  input,
  workspaceId,
  flatEntityMaps,
}: {
  input: CreateMyEntityInput;
  workspaceId: string;
  flatEntityMaps?: AllFlatEntityMapsByMetadataName;
}): UniversalFlatMyEntity => {
  const id = v4();
  const universalIdentifier = v4();

  // 1. Extract foreign key IDs BEFORE sanitization
  const parentEntityId = input.parentEntityId ?? null;

  // 2. Sanitize string properties
  const name = sanitizeString(input.name);
  const label = sanitizeString(input.label);
  const description = input.description ? sanitizeString(input.description) : null;

  // 3. Build base flat entity
  const baseFlatEntity = {
    id,
    universalIdentifier,
    workspaceId,
    applicationId: null,
    name,
    label,
    description,
    isCustom: true,
    parentEntityId,
    settings: input.settings ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  // 4. Resolve foreign keys to universal identifiers (if flatEntityMaps provided)
  if (flatEntityMaps) {
    return resolveEntityRelationUniversalIdentifiers({
      metadataName: 'myEntity',
      flatEntity: baseFlatEntity,
      flatEntityMaps,
    });
  }

  // 5. Return with null universal foreign keys if no maps
  return {
    ...baseFlatEntity,
    parentEntityUniversalIdentifier: null,
  };
};
```

**Key steps**:
1. Generate IDs (`id` and `universalIdentifier` with `v4()`)
2. Extract foreign keys **before** sanitization
3. Sanitize all string properties
4. Build base flat entity
5. Resolve foreign keys → universal identifiers

---

## Step 4: Create Flat Entity Module

**File**: `src/engine/metadata-modules/flat-my-entity/flat-my-entity.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MyEntityEntity } from 'src/engine/metadata-modules/my-entity/entities/my-entity.entity';
import { FlatMyEntityCacheService } from 'src/engine/metadata-modules/flat-my-entity/services/flat-my-entity-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([MyEntityEntity], 'metadata')],
  providers: [FlatMyEntityCacheService],
  exports: [FlatMyEntityCacheService],
})
export class FlatMyEntityModule {}
```

**Rules**:
- Import entity with `'metadata'` datasource
- Export cache service for use in other modules

---

## Common Patterns

### Pattern: Foreign Key Resolution

```typescript
// Extract foreign keys BEFORE sanitization
const parentEntityId = input.parentEntityId ?? null;

// After building base entity, resolve to universal identifiers
const universalFlatEntity = resolveEntityRelationUniversalIdentifiers({
  metadataName: 'myEntity',
  flatEntity: baseFlatEntity,
  flatEntityMaps,
});
```

### Pattern: JSONB with SerializedRelation

```typescript
// For JSONB properties containing foreign keys
const settings = input.settings
  ? {
      ...input.settings,
      fieldMetadataId: input.settings.fieldMetadataId,
    }
  : null;

// After resolution, JSONB foreign keys become universal identifiers
return resolveEntityRelationUniversalIdentifiers({
  metadataName: 'myEntity',
  flatEntity: { ...baseFlatEntity, settings },
  flatEntityMaps,
});
```

### Pattern: Update Transform

```typescript
// from-update-my-entity-input-to-universal-flat-my-entity-updates.util.ts
export const fromUpdateMyEntityInputToUniversalFlatMyEntityUpdates = ({
  input,
  flatEntityMaps,
}: {
  input: UpdateMyEntityInput;
  flatEntityMaps?: AllFlatEntityMapsByMetadataName;
}): Partial<UniversalFlatMyEntity> => {
  const updates: Partial<UniversalFlatMyEntity> = {};

  if (input.name !== undefined) {
    updates.name = sanitizeString(input.name);
  }

  if (input.parentEntityId !== undefined) {
    updates.parentEntityId = input.parentEntityId;
  }

  updates.updatedAt = new Date().toISOString();

  // Resolve foreign keys if maps provided
  if (flatEntityMaps) {
    return resolveEntityRelationUniversalIdentifiers({
      metadataName: 'myEntity',
      flatEntity: updates as any,
      flatEntityMaps,
    });
  }

  return updates;
};
```

---

## Checklist

Before moving to Step 3:

- [ ] Cache service created with `@WorkspaceCache` decorator
- [ ] Cache uses `withDeleted: true`
- [ ] Cache key follows `flat{EntityName}Maps` pattern
- [ ] Entity-to-flat conversion implemented
- [ ] `universalIdentifier` set correctly (generated with `v4()`)
- [ ] Create input transform implemented
- [ ] Update input transform implemented (if needed)
- [ ] Foreign keys extracted before sanitization
- [ ] String properties sanitized
- [ ] Foreign keys resolved to universal identifiers
- [ ] Flat entity module created and exports cache service

---

## Next Step

Once cache and transform utilities are complete, proceed to:
**[Syncable Entity: Builder & Validation (Step 3/6)](../syncable-entity-builder-and-validation/SKILL.md)**

For complete workflow, see `@creating-syncable-entity` rule.
