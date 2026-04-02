---
name: query-hooks
description: Create pre-query and post-query hooks to intercept CRUD operations on workspace objects in twenty-server. Use when auto-populating fields, enforcing business rules, validating permissions, or triggering side effects on record create/update.
---

# Query Hooks (CRUD Interception)

**Purpose**: Step-by-step guide for creating pre-query and post-query hooks that intercept workspace object CRUD operations in the Twenty server.

**When to use**: When you need to automatically populate fields before insert, enforce business rules before update, validate permissions, or trigger side effects after a record is saved.

---

## Pre-Hook vs Post-Hook

| Aspect | Pre-Hook | Post-Hook |
|--------|----------|-----------|
| **Runs** | BEFORE database write | AFTER successful write |
| **Can reject?** | Yes (throw error) | No (already written) |
| **Returns** | Modified payload | `void` |
| **Use for** | Auto-populate fields, validate, enforce edit windows | Enrich records, trigger side effects, compute derived fields |

**Rule of thumb:** If the field must exist for RLS or validation to pass, set it in a pre-hook. If it's enrichment that can happen after the fact, use a post-hook.

---

## Directory Structure

```
packages/twenty-server/src/modules/{entity}/
└── query-hooks/
    ├── {entity}-create-one.pre-query.hook.ts
    ├── {entity}-create-many.pre-query.hook.ts
    ├── {entity}-update-one.pre-query.hook.ts
    ├── {entity}-update-many.pre-query.hook.ts
    ├── {entity}-create-one.post-query.hook.ts
    ├── {entity}-create-many.post-query.hook.ts
    ├── {entity}-update-one.post-query.hook.ts
    ├── {entity}-update-many.post-query.hook.ts
    └── {entity}-query-hook.module.ts
```

Create only the hooks you need. Not every entity needs all eight.

---

## Step 1: Create a Pre-Query Hook

**File**: `modules/{entity}/query-hooks/{entity}-create-one.pre-query.hook.ts`

```typescript
import { Injectable } from '@nestjs/common';

import {
  WorkspaceQueryHook,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkspacePreQueryHookInstance,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-pre-query-hook.interface';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

@Injectable()
@WorkspaceQueryHook(`myEntity.createOne`)
export class MyEntityCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    // inject other services as needed
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs,
  ): Promise<CreateOneResolverArgs> {
    // Auto-populate fields
    payload.data.someField = computedValue;

    return payload; // MUST return the (possibly modified) payload
  }
}
```

**Key points:**
- `@Injectable()` is required for pre-hooks
- Decorator string format: `` `{objectName}.{operation}` `` where objectName matches the workspace object name
- Operations: `createOne`, `createMany`, `updateOne`, `updateMany`
- The `execute` method MUST return the payload (modified or unchanged)
- The `_objectName` parameter is conventionally unused (underscore prefix)

### Update hook variant

For update hooks, the payload type and available data differ:

```typescript
@Injectable()
@WorkspaceQueryHook(`myEntity.updateOne`)
export class MyEntityUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    // payload.id — the record being updated
    // payload.data — the fields being changed

    // Fetch existing record if needed for validation
    const repo = await this.globalWorkspaceOrmManager.getRepository(
      authContext.workspace.id,
      'myEntity',
      { shouldBypassPermissionChecks: true },
    );
    const existing = await repo.findOne({ where: { id: payload.id } });

    // Enforce business rules
    if (!isAllowed(existing)) {
      throw new ForbiddenError('Operation not permitted', {
        userFriendlyMessage: msg`You cannot edit this record`,
      });
    }

    return payload;
  }
}
```

### Bulk (many) variant

For `createMany` / `updateMany`, the payload contains an array:

```typescript
@Injectable()
@WorkspaceQueryHook(`myEntity.createMany`)
export class MyEntityCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs,
  ): Promise<CreateManyResolverArgs> {
    // payload.data is an array
    for (const record of payload.data) {
      record.someField = computedValue;
    }
    return payload;
  }
}
```

---

## Step 2: Create a Post-Query Hook

**File**: `modules/{entity}/query-hooks/{entity}-create-one.post-query.hook.ts`

```typescript
import {
  WorkspaceQueryHook,
  WorkspaceQueryHookType,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import {
  WorkspacePostQueryHookInstance,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-post-query-hook.interface';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@WorkspaceQueryHook({
  key: `myEntity.createOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class MyEntityCreateOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: ObjectRecord[],
  ): Promise<void> {
    // payload is an array of created/updated records
    for (const record of payload) {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          // Enrich record, compute derived fields, trigger side effects
          await enrichAfterSave(record, authContext.workspace.id);
        },
        authContext as WorkspaceAuthContext,
      );
    }
  }
}
```

**Key differences from pre-hooks:**
- Decorator uses **object syntax** with explicit `type: WorkspaceQueryHookType.POST_HOOK`
- `@Injectable()` is NOT required for post-hooks
- Implements `WorkspacePostQueryHookInstance` (not `Pre`)
- Payload is `ObjectRecord[]` (the saved records, not resolver args)
- Returns `Promise<void>` (no payload to return)
- Cannot reject the operation (record is already saved)

---

## Step 3: Create the Hook Module

**File**: `modules/{entity}/query-hooks/{entity}-query-hook.module.ts`

```typescript
import { Module } from '@nestjs/common';

import { AgentProfileModule } from 'src/modules/agent-profile/agent-profile.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

import { MyEntityCreateOnePreQueryHook } from './{entity}-create-one.pre-query.hook';
import { MyEntityCreateManyPreQueryHook } from './{entity}-create-many.pre-query.hook';
import { MyEntityCreateOnePostQueryHook } from './{entity}-create-one.post-query.hook';
import { MyEntityCreateManyPostQueryHook } from './{entity}-create-many.post-query.hook';

@Module({
  imports: [
    AgentProfileModule,      // if hooks need agent resolution
    WorkspaceCacheModule,     // if hooks need roles/permissions cache
  ],
  providers: [
    MyEntityCreateOnePreQueryHook,
    MyEntityCreateManyPreQueryHook,
    MyEntityCreateOnePostQueryHook,
    MyEntityCreateManyPostQueryHook,
  ],
})
export class MyEntityQueryHookModule {}
```

**Then register the module** in the parent module (typically the app module or the entity's own module):

```typescript
imports: [
  // ... existing imports
  MyEntityQueryHookModule,
],
```

The `@WorkspaceQueryHook` decorator handles discovery — NestJS instantiates the providers, and the query runner finds them by their decorator key.

---

## Step 4: Add Utility Functions

Extract reusable logic into `utils/`:

**File**: `modules/{entity}/utils/build-{entity}-display-name.util.ts`

```typescript
export const buildMyEntityDisplayName = async (
  data: { carrierId?: string; productId?: string },
  workspaceId: string,
  ormManager: GlobalWorkspaceOrmManager,
): Promise<string> => {
  // Lookup related records and build display name
  const carrier = await lookupCarrier(data.carrierId, workspaceId, ormManager);
  return `${carrier?.name ?? 'Unknown'} - ${product?.name ?? 'Unknown'}`;
};
```

**File naming**: `{verb}-{entity}-{noun}.util.ts` (e.g., `build-policy-display-name.util.ts`, `enrich-policy-after-save.util.ts`)

---

## Common Patterns

### Auto-assign agentId (for RLS)

This is the most common Omnia pre-hook pattern. Required when the entity has an `agent` relation and RLS predicates check ownership:

```typescript
const agentProfileId =
  await this.agentProfileResolverService.resolveAgentProfileId(
    authContext.workspace.id,
    authContext.workspaceMemberId,
  );

payload.data.agentId = agentProfileId;
```

### Edit window enforcement

Check how long ago the record was created and block edits after the window:

```typescript
const rolesPermissions =
  await this.workspaceCacheService.getRolesPermissions(
    authContext.workspace.id,
  );

const editWindowMinutes = getEditWindowMinutes(
  rolesPermissions,
  authContext,
  objectName,
);

if (editWindowMinutes !== null) {
  const ageMs = Date.now() - new Date(existing.createdAt).getTime();
  const editWindowMs = editWindowMinutes * 60 * 1000;

  if (ageMs > editWindowMs) {
    throw new ForbiddenError('Edit window expired', {
      userFriendlyMessage: msg`This record can no longer be edited (${formatDuration(editWindowMs)} edit window)`,
    });
  }
}
```

### Post-save enrichment

Set derived fields after the record exists:

```typescript
await repo.update(record.id, {
  submittedDate: getNowUtc(),
  lifetimeValue: await lookupLTV(record, workspaceId, ormManager),
});
```

### Blocking with ForbiddenError

```typescript
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

throw new ForbiddenError('Internal reason', {
  userFriendlyMessage: msg`User-facing explanation`,
});
```

---

## Customization Tracking

After creating query hooks, update tracking:

1. Add to `CUSTOMIZATIONS.md` under the entity's "Custom Server Modules" section
2. Add `check_file_exists` entries in `scripts/check-customizations.sh`
3. Add `check_file_contains` for critical logic patterns (e.g., agentId assignment)

See [customization-tracking skill](../customization-tracking/SKILL.md).

---

## Checklist

- [ ] Pre-hooks use `@Injectable()` + `@WorkspaceQueryHook(\`entity.operation\`)`
- [ ] Post-hooks use `@WorkspaceQueryHook({ key, type: POST_HOOK })` (no `@Injectable()`)
- [ ] Pre-hooks implement `WorkspacePreQueryHookInstance` and return the payload
- [ ] Post-hooks implement `WorkspacePostQueryHookInstance` and return void
- [ ] Hook key matches the workspace object name exactly (e.g., `policy`, not `Policy`)
- [ ] Bulk variants (createMany/updateMany) handle array payloads
- [ ] Module imports all required dependencies (AgentProfileModule, WorkspaceCacheModule, etc.)
- [ ] Module registered in parent module
- [ ] Utility functions extracted to `utils/` directory
- [ ] Customization tracking updated
- [ ] `npx nx typecheck twenty-server` passes
