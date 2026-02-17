---
name: syncable-entity-types-and-constants
description: Define types, entities, and central constant registrations for syncable entities in Twenty's workspace migration system. Use when creating new syncable entities, defining TypeORM entities, flat entity types, or registering in central constants (ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME, ALL_ONE_TO_MANY_METADATA_RELATIONS, ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY, ALL_MANY_TO_ONE_METADATA_RELATIONS).
---

# Syncable Entity: Types & Constants (Step 1/6)

**Purpose**: Define all types, entities, and register in central constants. This is the foundation - everything else depends on these types being correct.

**When to use**: First step when creating any new syncable entity. Must be completed before other steps.

---

## Quick Start

This step creates:
1. Metadata name constant (twenty-shared)
2. TypeORM entity (extends `SyncableEntity`)
3. Flat entity types
4. Action types (universal + flat)
5. Central constant registrations (5 constants)

---

## Step 1: Add Metadata Name

**File**: `packages/twenty-shared/src/metadata/all-metadata-name.constant.ts`

```typescript
export const ALL_METADATA_NAME = {
  // ... existing entries
  myEntity: 'myEntity',
} as const;
```

---

## Step 2: Create TypeORM Entity

**File**: `src/engine/metadata-modules/my-entity/entities/my-entity.entity.ts`

```typescript
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'myEntity' })
export class MyEntityEntity extends SyncableEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  label: string;

  @Column({ type: 'boolean', default: true })
  isCustom: boolean;

  // Foreign key example (optional)
  @Column({ type: 'uuid', nullable: true })
  parentEntityId: string | null;

  @ManyToOne(() => ParentEntityEntity, { nullable: true })
  @JoinColumn({ name: 'parentEntityId' })
  parentEntity: ParentEntityEntity | null;

  // JSONB column example (optional)
  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any> | null;
}
```

**Key rules**:
- Must extend `SyncableEntity` (provides `id`, `universalIdentifier`, `applicationId`, etc.)
- Must have `isCustom` boolean column
- Use `@Column({ type: 'jsonb' })` for JSON data

---

## Step 3: Define Flat Entity Types

**File**: `src/engine/metadata-modules/flat-my-entity/types/flat-my-entity.type.ts`

```typescript
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type MyEntityEntity } from 'src/engine/metadata-modules/my-entity/entities/my-entity.entity';

export type FlatMyEntity = FlatEntityFrom<MyEntityEntity>;
```

**Maps file** (if entity has indexed lookups):

```typescript
// flat-my-entity-maps.type.ts
export type FlatMyEntityMaps = {
  byId: Record<string, FlatMyEntity>;
  byName: Record<string, FlatMyEntity>;
  // Add other indexes as needed
};
```

---

## Step 4: Define Editable Properties

**File**: `src/engine/metadata-modules/flat-my-entity/constants/editable-flat-my-entity-properties.constant.ts`

```typescript
export const EDITABLE_FLAT_MY_ENTITY_PROPERTIES = [
  'name',
  'label',
  'description',
  'parentEntityId',
  'settings',
] as const satisfies ReadonlyArray<keyof FlatMyEntity>;
```

**Rule**: Only include properties that can be updated (exclude `id`, `createdAt`, `universalIdentifier`, etc.)

---

## Step 5: Define Action Types

**File**: `src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/my-entity/types/workspace-migration-my-entity-action.type.ts`

```typescript
import { type FlatMyEntity } from 'src/engine/metadata-modules/flat-my-entity/types/flat-my-entity.type';
import { type UniversalFlatMyEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-my-entity.type';

// Universal actions (used by builder/runner)
export type UniversalCreateMyEntityAction = {
  type: 'create';
  metadataName: 'myEntity';
  universalFlatEntity: UniversalFlatMyEntity;
};

export type UniversalUpdateMyEntityAction = {
  type: 'update';
  metadataName: 'myEntity';
  universalFlatEntity: UniversalFlatMyEntity;
  universalUpdates: Partial<UniversalFlatMyEntity>;
};

export type UniversalDeleteMyEntityAction = {
  type: 'delete';
  metadataName: 'myEntity';
  universalFlatEntity: UniversalFlatMyEntity;
};

// Flat actions (internal to runner)
export type FlatCreateMyEntityAction = {
  type: 'create';
  metadataName: 'myEntity';
  flatEntity: FlatMyEntity;
};

export type FlatUpdateMyEntityAction = {
  type: 'update';
  metadataName: 'myEntity';
  flatEntity: FlatMyEntity;
  updates: Partial<FlatMyEntity>;
};

export type FlatDeleteMyEntityAction = {
  type: 'delete';
  metadataName: 'myEntity';
  flatEntity: FlatMyEntity;
};
```

---

## Step 6: Register in Central Constants

### 6a. AllFlatEntityTypesByMetadataName

**File**: `src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name.ts`

```typescript
export type AllFlatEntityTypesByMetadataName = {
  // ... existing entries
  myEntity: {
    flatEntityMaps: FlatMyEntityMaps;
    universalActions: {
      create: UniversalCreateMyEntityAction;
      update: UniversalUpdateMyEntityAction;
      delete: UniversalDeleteMyEntityAction;
    };
    flatActions: {
      create: FlatCreateMyEntityAction;
      update: FlatUpdateMyEntityAction;
      delete: FlatDeleteMyEntityAction;
    };
    flatEntity: FlatMyEntity;
    universalFlatEntity: UniversalFlatMyEntity;
    entity: MyEntityEntity;
  };
};
```

### 6b. ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME

**File**: `src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts`

```typescript
export const ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME = {
  // ... existing entries
  myEntity: {
    name: { toCompare: true },
    label: { toCompare: true },
    description: { toCompare: true },
    parentEntityId: {
      toCompare: true,
      universalProperty: 'parentEntityUniversalIdentifier',
    },
    settings: {
      toCompare: true,
      toStringify: true,
      universalProperty: 'universalSettings',
    },
  },
} as const;
```

**Rules**:
- `toCompare: true` → Editable property (checked for changes)
- `toStringify: true` → JSONB/object property (needs JSON serialization)
- `universalProperty` → Maps to universal version (for foreign keys & JSONB with `SerializedRelation`)

### 6c. ALL_ONE_TO_MANY_METADATA_RELATIONS

**File**: `src/engine/metadata-modules/flat-entity/constant/all-one-to-many-metadata-relations.constant.ts`

This constant is **type-checked** — values for `metadataName`, `flatEntityForeignKeyAggregator`, and `universalFlatEntityForeignKeyAggregator` are derived from entity type definitions. The aggregator names follow the pattern: remove trailing `'s'` from the relation property name, then append `Ids` or `UniversalIdentifiers`.

```typescript
export const ALL_ONE_TO_MANY_METADATA_RELATIONS = {
  // ... existing entries
  myEntity: {
    // If myEntity has a `childEntities: ChildEntityEntity[]` property:
    childEntities: {
      metadataName: 'childEntity',
      flatEntityForeignKeyAggregator: 'childEntityIds',
      universalFlatEntityForeignKeyAggregator: 'childEntityUniversalIdentifiers',
    },
    // null for relations to non-syncable entities
    someNonSyncableRelation: null,
  },
} as const;
```

### 6d. ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY

**File**: `src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-foreign-key.constant.ts`

Low-level primitive constant. Only contains `foreignKey` — the column name ending in `Id` that stores the foreign key. Type-checked against entity properties.

```typescript
export const ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY = {
  // ... existing entries
  myEntity: {
    workspace: null,
    application: null,
    parentEntity: {
      foreignKey: 'parentEntityId',
    },
  },
} as const;
```

### 6e. ALL_MANY_TO_ONE_METADATA_RELATIONS

**File**: `src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant.ts`

Derived from both `ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY` (for `foreignKey` type and `universalForeignKey` derivation) and `ALL_ONE_TO_MANY_METADATA_RELATIONS` (for `inverseOneToManyProperty` key constraint). This is the main constant consumed by utils and optimistic tooling.

```typescript
export const ALL_MANY_TO_ONE_METADATA_RELATIONS = {
  // ... existing entries
  myEntity: {
    workspace: null,
    application: null,
    parentEntity: {
      metadataName: 'parentEntity',
      foreignKey: 'parentEntityId',
      inverseOneToManyProperty: 'myEntities',  // key in ALL_ONE_TO_MANY_METADATA_RELATIONS['parentEntity'], or null if no inverse
      isNullable: false,
      universalForeignKey: 'parentEntityUniversalIdentifier',
    },
  },
} as const;
```

**Derivation dependency graph**:

```
ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY     ALL_ONE_TO_MANY_METADATA_RELATIONS
(foreignKey only)                        (metadataName, aggregators)
  │                                        │
  │ FK type + universalFK derivation       │ inverseOneToManyProperty keys
  │                                        │
  └────────────────┬───────────────────────┘
                   ▼
    ALL_MANY_TO_ONE_METADATA_RELATIONS
    (metadataName, foreignKey, inverseOneToManyProperty,
     isNullable, universalForeignKey)
```

**Rules**:
- `workspace: null`, `application: null` — always present, always null (non-syncable relations)
- `inverseOneToManyProperty` — must be a key in `ALL_ONE_TO_MANY_METADATA_RELATIONS[targetMetadataName]`, or `null` if the target entity doesn't expose an inverse one-to-many relation
- `universalForeignKey` — derived from `foreignKey` by replacing the `Id` suffix with `UniversalIdentifier`
- Optimistic utils resolve `flatEntityForeignKeyAggregator` / `universalFlatEntityForeignKeyAggregator` at runtime by looking up `inverseOneToManyProperty` in `ALL_ONE_TO_MANY_METADATA_RELATIONS`

---

## Checklist

Before moving to Step 2:

- [ ] Metadata name added to `ALL_METADATA_NAME`
- [ ] TypeORM entity created (extends `SyncableEntity`)
- [ ] `isCustom` column added
- [ ] Flat entity type defined
- [ ] Flat entity maps type defined (if needed)
- [ ] Editable properties constant defined
- [ ] Universal and flat action types defined
- [ ] Registered in `AllFlatEntityTypesByMetadataName`
- [ ] Registered in `ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME`
- [ ] Registered in `ALL_ONE_TO_MANY_METADATA_RELATIONS` (if entity has one-to-many relations)
- [ ] Registered in `ALL_MANY_TO_ONE_METADATA_FOREIGN_KEY`
- [ ] Registered in `ALL_MANY_TO_ONE_METADATA_RELATIONS`
- [ ] TypeScript compiles without errors

---

## Next Step

Once all types and constants are defined, proceed to:
**[Syncable Entity: Cache & Transform (Step 2/6)](../syncable-entity-cache-and-transform/SKILL.md)**

For complete workflow, see `@creating-syncable-entity` rule.
