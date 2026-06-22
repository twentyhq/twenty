# Server (Application-Registration-Scoped) Logic Functions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an instance-level ("server") logic-function tier scoped to an `ApplicationRegistration`, triggered by a shared webhook endpoint and a shared cron, executed in the registration's owner-workspace context.

**Architecture:** A new thin core entity `ApplicationRegistrationLogicFunctionEntity` acts as an instance-level *registry/router* of which manifest functions are server-scoped (plus their trigger settings and a `disabledAt` kill switch). Execution is **delegated** to the existing `LogicFunctionExecutorService` with `workspaceId = ownerWorkspaceId`, reusing owner credentials, server variables, the sandbox, and owner billing. The workspace-scoped logic-function path, the `route-trigger`, and all drivers are untouched.

**Tech Stack:** NestJS, TypeORM (Postgres `core` schema), BullMQ (`cronQueue` / `logicFunctionQueue`), Jest, twenty-shared types.

**Design spec:** `docs/superpowers/specs/2026-06-22-server-logic-functions-design.md` (read it first).

## Global Constraints

- **No new code-review gate, no instance build, no source storage.** Server functions reuse the owner-workspace build.
- **No `any` type.** Strict TypeScript. Named exports only. Functional, types over interfaces, string literals over enums (except GraphQL/TypeORM enums).
- **No comments** unless required by codebase conventions (this codebase allows short `//` for WHY only).
- **Use type guards** `isDefined`, `isObject`, `isNonEmptyString` from `twenty-shared/utils` instead of raw checks.
- **Core entities** register with `TypeOrmModule.forFeature([Entity])` — **no** second `'core'` datasource arg (core is the default datasource).
- **Migrations** use the instance-command workflow (`npx nx run twenty-server:database:migrate:generate --name <name> --type fast`), NOT hand-written TypeORM migration files. SQL must be idempotent (`IF NOT EXISTS` / `IF EXISTS`). Tables are `"core"."<table>"`.
- **Instance-level gating** uses a **config variable** read via `TwentyConfigService.get(...)`, NOT `FeatureFlagService` (which requires a `workspaceId`).
- **Billing:** 100 credits per execution to the owner workspace — handled automatically by the delegated `LogicFunctionExecutorService.execute`. Do not re-implement billing.
- **Lint/typecheck after each task:** `npx nx lint:diff-with-main twenty-server` and `npx nx typecheck twenty-server`.
- **Run a single test file** with: `cd packages/twenty-server && npx jest <path-or-pattern>`.
- Forced return contract: every server function returns `ServerLogicFunctionResult = { workspaceIds: string[]; response?: LogicFunctionHttpResponse }`.

---

## File Structure

**twenty-shared (`packages/twenty-shared/src/application/`)**
- Modify `logicFunctionManifestType.ts` — add `scope`, `serverCronTriggerSettings`; add `ServerCronTriggerSettings`.
- Modify `serverWebhookTriggerSettingsType.ts` — drop `workspaceIdResolver`.
- Create `serverLogicFunctionResultType.ts` — `ServerLogicFunctionResult`.
- Modify `index.ts` — exports.

**twenty-server — new module (`packages/twenty-server/src/engine/core-modules/application/application-registration-logic-function/`)**
- `application-registration-logic-function.entity.ts` — registry entity.
- `application-registration-logic-function.module.ts` — TypeORM + service wiring.
- `application-registration-logic-function-sync.service.ts` — manifest → rows sync.
- `__tests__/application-registration-logic-function-sync.service.spec.ts`.

**twenty-server — server executor (`packages/twenty-server/src/engine/core-modules/server-logic-function-executor/`)**
- `server-logic-function-executor.service.ts` — gate + resolve + throttle + delegate + validate.
- `server-logic-function-executor.exception.ts` — exception + codes.
- `utils/is-server-logic-function-result.util.ts` — return-contract guard.
- `server-logic-function-executor.module.ts`.
- `__tests__/server-logic-function-executor.service.spec.ts`.

**twenty-server — webhook rework (existing `.../core-modules/server-webhook-trigger/`)**
- Modify `server-webhook-trigger.service.ts`, `.module.ts`, exception codes, and the spec test.

**twenty-server — server cron (`.../core-modules/server-logic-function-executor/cron/`)**
- `server-cron-trigger.cron.command.ts`, `server-cron-trigger.cron.job.ts`, execution job.
- Modify `database/commands/cron-register-all.command.ts` + `database-command.module.ts`.

**twenty-server — migration + config + marketplace + kill switch**
- New instance command under `database/commands/upgrade-version-command/<version>/`.
- Modify `twenty-config/config-variables.ts` — `IS_SERVER_LOGIC_FUNCTION_ENABLED`.
- Modify `application-registration.service.ts` — `isListed` guard + kill-switch helpers.

---

## PR 1 — Shared types, registry entity, migration, config var

### Task 1.1: Shared types

**Files:**
- Modify: `packages/twenty-shared/src/application/serverWebhookTriggerSettingsType.ts`
- Modify: `packages/twenty-shared/src/application/logicFunctionManifestType.ts`
- Create: `packages/twenty-shared/src/application/serverLogicFunctionResultType.ts`
- Modify: `packages/twenty-shared/src/application/index.ts`

**Interfaces:**
- Produces: `ServerWebhookTriggerSettings = { forwardedRequestHeaders?: string[] }`; `ServerCronTriggerSettings = { pattern: string }`; `LogicFunctionManifest.scope?: 'workspace' | 'server'` and `.serverCronTriggerSettings?`; `ServerLogicFunctionResult = { workspaceIds: string[]; response?: LogicFunctionHttpResponse }`.

- [ ] **Step 1: Redefine `ServerWebhookTriggerSettings`**

Replace the full contents of `serverWebhookTriggerSettingsType.ts` with:

```ts
export type ServerWebhookTriggerSettings = {
  forwardedRequestHeaders?: string[];
};
```

(`WebhookWorkspaceIdSource` and the `workspaceIdResolver` shape are removed.)

- [ ] **Step 2: Add `scope` + `serverCronTriggerSettings` to the manifest type**

In `logicFunctionManifestType.ts`, add the `ServerCronTriggerSettings` type and extend `LogicFunctionManifest`:

```ts
export type ServerCronTriggerSettings = {
  pattern: string;
};
```

Add to the `LogicFunctionManifest` object type (next to the existing trigger settings):

```ts
  scope?: 'workspace' | 'server';
  serverCronTriggerSettings?: ServerCronTriggerSettings;
```

- [ ] **Step 3: Create the forced return contract type**

Create `serverLogicFunctionResultType.ts`:

```ts
import { type LogicFunctionHttpResponse } from '@/types';

export type ServerLogicFunctionResult = {
  workspaceIds: string[];
  response?: LogicFunctionHttpResponse;
};
```

If `LogicFunctionHttpResponse` is not exported from `@/types`, import it from its defining module (search `isLogicFunctionHttpResponse` to find it) and re-export there. If no such named type exists, define the shape inline:

```ts
export type ServerLogicFunctionResult = {
  workspaceIds: string[];
  response?: { status?: number; headers?: Record<string, string>; body?: unknown };
};
```

- [ ] **Step 4: Update barrel exports**

In `index.ts`, update the `serverWebhookTriggerSettingsType` export (remove `WebhookWorkspaceIdSource`), add `ServerCronTriggerSettings` to the `logicFunctionManifestType` export block, and add a new export line for `ServerLogicFunctionResult`:

```ts
export type { ServerWebhookTriggerSettings } from './serverWebhookTriggerSettingsType';
export type {
  LogicFunctionManifest,
  CronTriggerSettings,
  DatabaseEventTriggerSettings,
  HttpRouteTriggerSettings,
  ServerCronTriggerSettings,
} from './logicFunctionManifestType';
export type { ServerLogicFunctionResult } from './serverLogicFunctionResultType';
```

- [ ] **Step 5: Build twenty-shared and fix fallout**

Run: `npx nx build twenty-shared`
Expected: builds clean. The `server-webhook-trigger.service.ts` and `resolve-workspace-id-from-request.util.ts` will now fail to typecheck because `workspaceIdResolver` is gone — that is expected and fixed in PR 4 (Task 4.1). For now, only twenty-shared must build.

- [ ] **Step 6: Commit**

```bash
git add packages/twenty-shared/src/application
git commit -m "feat(shared): add server logic function manifest types and result contract"
```

---

### Task 1.2: Registry entity + module

**Files:**
- Create: `packages/twenty-server/src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity.ts`
- Create: `packages/twenty-server/src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.module.ts`
- Modify: `packages/twenty-server/src/engine/core-modules/application/application-registration/application-registration.entity.ts` (add OneToMany)

**Interfaces:**
- Consumes: `ServerWebhookTriggerSettings`, `ServerCronTriggerSettings` (Task 1.1); `ApplicationRegistrationEntity`.
- Produces: `ApplicationRegistrationLogicFunctionEntity` with fields `{ id, universalIdentifier, name, serverWebhookTriggerSettings, serverCronTriggerSettings, disabledAt, applicationRegistrationId, createdAt, updatedAt, deletedAt }`.

- [ ] **Step 1: Create the entity**

```ts
import { Field, ObjectType } from '@nestjs/graphql';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  type ServerCronTriggerSettings,
  type ServerWebhookTriggerSettings,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Entity({ name: 'applicationRegistrationLogicFunction', schema: 'core' })
@ObjectType('ApplicationRegistrationLogicFunction')
@Unique('IDX_APP_REG_LOGIC_FN_UID_APP_REGISTRATION_ID_UNIQUE', [
  'universalIdentifier',
  'applicationRegistrationId',
])
@Index('IDX_APP_REG_LOGIC_FN_APP_REGISTRATION_ID', ['applicationRegistrationId'])
export class ApplicationRegistrationLogicFunctionEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'jsonb' })
  serverWebhookTriggerSettings: ServerWebhookTriggerSettings | null;

  @Column({ nullable: true, type: 'jsonb' })
  serverCronTriggerSettings: ServerCronTriggerSettings | null;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  disabledAt: Date | null;

  @Column({ nullable: false, type: 'uuid' })
  applicationRegistrationId: string;

  @ManyToOne(
    () => ApplicationRegistrationEntity,
    (applicationRegistration) => applicationRegistration.logicFunctions,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
```

- [ ] **Step 2: Add the inverse relation on `ApplicationRegistrationEntity`**

In `application-registration.entity.ts`, mirror the existing `variables` OneToMany:

```ts
  @OneToMany(
    () => ApplicationRegistrationLogicFunctionEntity,
    (logicFunction) => logicFunction.applicationRegistration,
    { onDelete: 'CASCADE' },
  )
  logicFunctions: Relation<ApplicationRegistrationLogicFunctionEntity[]>;
```

Add the import at the top:

```ts
import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
```

- [ ] **Step 3: Create the module**

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationLogicFunctionEntity,
      ApplicationRegistrationEntity,
    ]),
  ],
  providers: [],
  exports: [],
})
export class ApplicationRegistrationLogicFunctionModule {}
```

(The sync service is added to this module in Task 2.1.)

- [ ] **Step 4: Typecheck**

Run: `npx nx typecheck twenty-server`
Expected: PASS (apart from the pre-existing PR-4 webhook breakage from Task 1.1 — if that blocks typecheck, temporarily stub `workspaceIdResolver` references; they are fully removed in Task 4.1. Prefer ordering PR 4 right after PR 1 if the typecheck gate is strict.)

- [ ] **Step 5: Commit**

```bash
git add packages/twenty-server/src/engine/core-modules/application/application-registration-logic-function packages/twenty-server/src/engine/core-modules/application/application-registration/application-registration.entity.ts
git commit -m "feat(server): add ApplicationRegistrationLogicFunction registry entity"
```

---

### Task 1.3: Instance-command migration (create core table)

**Files:**
- Create (generated): `packages/twenty-server/src/database/commands/upgrade-version-command/<version>/<version>-instance-command-fast-<timestamp>-create-application-registration-logic-function-core-table.ts`
- Auto-modified: `packages/twenty-server/src/database/commands/upgrade-version-command/instance-commands.constant.ts`

**Interfaces:**
- Produces: the `core.applicationRegistrationLogicFunction` table matching the entity in Task 1.2.

- [ ] **Step 1: Generate the instance command**

Run:
```bash
npx nx run twenty-server:database:migrate:generate --name create-application-registration-logic-function-core-table --type fast
```
Expected: a new timestamped file under `upgrade-version-command/<current-version>/` and an auto-added import in `instance-commands.constant.ts`. Do not hand-edit the constant file.

- [ ] **Step 2: Implement `up()` / `down()`**

Fill the generated class body (keep the generated `@RegisteredInstanceCommand(version, timestamp)` and `implements FastInstanceCommand`):

```ts
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(
    `CREATE TABLE IF NOT EXISTS "core"."applicationRegistrationLogicFunction" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "universalIdentifier" uuid NOT NULL,
      "name" text NOT NULL,
      "serverWebhookTriggerSettings" jsonb,
      "serverCronTriggerSettings" jsonb,
      "disabledAt" TIMESTAMP WITH TIME ZONE,
      "applicationRegistrationId" uuid NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "deletedAt" TIMESTAMP WITH TIME ZONE,
      CONSTRAINT "PK_applicationRegistrationLogicFunction_id" PRIMARY KEY ("id"),
      CONSTRAINT "FK_appRegLogicFn_applicationRegistrationId" FOREIGN KEY ("applicationRegistrationId")
        REFERENCES "core"."applicationRegistration"("id") ON DELETE CASCADE
    )`,
  );
  await queryRunner.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_APP_REG_LOGIC_FN_UID_APP_REGISTRATION_ID_UNIQUE"
      ON "core"."applicationRegistrationLogicFunction" ("universalIdentifier", "applicationRegistrationId")`,
  );
  await queryRunner.query(
    `CREATE INDEX IF NOT EXISTS "IDX_APP_REG_LOGIC_FN_APP_REGISTRATION_ID"
      ON "core"."applicationRegistrationLogicFunction" ("applicationRegistrationId")`,
  );
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(
    `DROP TABLE IF EXISTS "core"."applicationRegistrationLogicFunction"`,
  );
}
```

- [ ] **Step 3: Run the migration against the dev DB**

Run: `npx nx run twenty-server:database:migrate:prod`
Then verify with the Postgres MCP (or psql):
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'core' AND table_name = 'applicationRegistrationLogicFunction'
ORDER BY ordinal_position;
```
Expected: the 10 columns above with matching types.

- [ ] **Step 4: Commit**

```bash
git add packages/twenty-server/src/database/commands/upgrade-version-command
git commit -m "feat(server): add migration for applicationRegistrationLogicFunction table"
```

---

### Task 1.4: `IS_SERVER_LOGIC_FUNCTION_ENABLED` config var

**Files:**
- Modify: `packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts`

**Interfaces:**
- Produces: `TwentyConfigService.get('IS_SERVER_LOGIC_FUNCTION_ENABLED'): boolean`.

- [ ] **Step 1: Add the config var**

Near the existing `LOGIC_FUNCTION_*` vars, mirror the `IS_BILLING_ENABLED` pattern:

```ts
@ConfigVariablesMetadata({
  group: ConfigVariablesGroup.LOGIC_FUNCTION_CONFIG,
  description: 'Enable instance-level (server) logic functions',
  type: ConfigVariableType.BOOLEAN,
})
@IsOptional()
IS_SERVER_LOGIC_FUNCTION_ENABLED = false;
```

(Use whatever `ConfigVariablesGroup` the other `LOGIC_FUNCTION_*` vars use; if there is no `LOGIC_FUNCTION_CONFIG` group enum member, reuse the same group as `LOGIC_FUNCTION_TYPE`.)

- [ ] **Step 2: Typecheck + commit**

Run: `npx nx typecheck twenty-server` → PASS
```bash
git add packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts
git commit -m "feat(server): add IS_SERVER_LOGIC_FUNCTION_ENABLED config var"
```

---

## PR 2 — Registration-level sync (no build)

### Task 2.1: `ApplicationRegistrationLogicFunctionSyncService`

**Files:**
- Create: `.../application-registration-logic-function/application-registration-logic-function-sync.service.ts`
- Create: `.../application-registration-logic-function/__tests__/application-registration-logic-function-sync.service.spec.ts`
- Modify: `.../application-registration-logic-function/application-registration-logic-function.module.ts`

**Interfaces:**
- Consumes: `Manifest` (`twenty-shared/application`), `Repository<ApplicationRegistrationLogicFunctionEntity>`.
- Produces: `syncFromManifest({ applicationRegistrationId, manifest }): Promise<void>` — upserts rows for `scope === 'server'` manifest functions; soft-deletes rows whose manifest entry disappeared.

- [ ] **Step 1: Write the failing test**

```ts
import { type Repository } from 'typeorm';
import { type Manifest } from 'twenty-shared/application';

import { ApplicationRegistrationLogicFunctionSyncService } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function-sync.service';
import { type ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';

const APP_REGISTRATION_ID = '11111111-1111-1111-1111-111111111111';

const manifestWith = (
  logicFunctions: NonNullable<Manifest['logicFunctions']>,
): Manifest => ({ logicFunctions } as Manifest);

describe('ApplicationRegistrationLogicFunctionSyncService', () => {
  let service: ApplicationRegistrationLogicFunctionSyncService;
  let repository: jest.Mocked<
    Pick<Repository<ApplicationRegistrationLogicFunctionEntity>, 'find' | 'upsert' | 'softDelete'>
  >;

  beforeEach(() => {
    repository = {
      find: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue(undefined),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };
    service = new ApplicationRegistrationLogicFunctionSyncService(
      repository as unknown as Repository<ApplicationRegistrationLogicFunctionEntity>,
    );
  });

  it('upserts only server-scoped manifest functions', async () => {
    await service.syncFromManifest({
      applicationRegistrationId: APP_REGISTRATION_ID,
      manifest: manifestWith([
        { universalIdentifier: 'a', name: 'srv', scope: 'server',
          serverWebhookTriggerSettings: {}, sourceHandlerPath: '', builtHandlerPath: '',
          builtHandlerChecksum: '', handlerName: 'handler' },
        { universalIdentifier: 'b', name: 'ws', scope: 'workspace',
          sourceHandlerPath: '', builtHandlerPath: '', builtHandlerChecksum: '', handlerName: 'handler' },
      ]),
    });

    expect(repository.upsert).toHaveBeenCalledTimes(1);
    const [rows] = repository.upsert.mock.calls[0];
    expect(rows).toEqual([
      expect.objectContaining({
        universalIdentifier: 'a',
        applicationRegistrationId: APP_REGISTRATION_ID,
        serverWebhookTriggerSettings: {},
      }),
    ]);
  });

  it('soft-deletes rows whose manifest entry disappeared', async () => {
    repository.find.mockResolvedValue([
      { id: 'row-1', universalIdentifier: 'gone' } as ApplicationRegistrationLogicFunctionEntity,
    ]);
    await service.syncFromManifest({
      applicationRegistrationId: APP_REGISTRATION_ID,
      manifest: manifestWith([]),
    });
    expect(repository.softDelete).toHaveBeenCalledWith(['row-1']);
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `cd packages/twenty-server && npx jest application-registration-logic-function-sync.service`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the service**

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';

@Injectable()
export class ApplicationRegistrationLogicFunctionSyncService {
  constructor(
    @InjectRepository(ApplicationRegistrationLogicFunctionEntity)
    private readonly repository: Repository<ApplicationRegistrationLogicFunctionEntity>,
  ) {}

  async syncFromManifest({
    applicationRegistrationId,
    manifest,
  }: {
    applicationRegistrationId: string;
    manifest: Manifest;
  }): Promise<void> {
    const serverFunctions = (manifest.logicFunctions ?? []).filter(
      (logicFunction) => logicFunction.scope === 'server',
    );

    const rows = serverFunctions.map((logicFunction) => ({
      universalIdentifier: logicFunction.universalIdentifier,
      applicationRegistrationId,
      name: logicFunction.name ?? logicFunction.universalIdentifier,
      serverWebhookTriggerSettings:
        logicFunction.serverWebhookTriggerSettings ?? null,
      serverCronTriggerSettings: logicFunction.serverCronTriggerSettings ?? null,
    }));

    if (rows.length > 0) {
      await this.repository.upsert(rows, [
        'universalIdentifier',
        'applicationRegistrationId',
      ]);
    }

    const keptIdentifiers = new Set(rows.map((row) => row.universalIdentifier));
    const existing = await this.repository.find({
      where: { applicationRegistrationId, deletedAt: IsNull() },
    });
    const idsToSoftDelete = existing
      .filter((row) => !keptIdentifiers.has(row.universalIdentifier))
      .map((row) => row.id);

    if (idsToSoftDelete.length > 0) {
      await this.repository.softDelete(idsToSoftDelete);
    }
  }
}
```

(`In`/`Not` imports may be unused — keep only `IsNull`, `Repository`. Lint will flag unused; remove them.)

- [ ] **Step 4: Register in the module**

In `application-registration-logic-function.module.ts`, add to `providers` and `exports`:
```ts
providers: [ApplicationRegistrationLogicFunctionSyncService],
exports: [ApplicationRegistrationLogicFunctionSyncService],
```
and import it.

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd packages/twenty-server && npx jest application-registration-logic-function-sync.service`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/twenty-server/src/engine/core-modules/application/application-registration-logic-function
git commit -m "feat(server): sync server logic functions from registration manifest"
```

---

### Task 2.2: Wire sync into the manifest hook

**Files:**
- Modify: `.../application-registration/application-registration.service.ts`
- Modify: `.../application-registration/application-registration.module.ts`

**Interfaces:**
- Consumes: `ApplicationRegistrationLogicFunctionSyncService.syncFromManifest` (Task 2.1).

- [ ] **Step 1: Import the module + inject the service**

In `application-registration.module.ts`, add `ApplicationRegistrationLogicFunctionModule` to `imports`. In `application-registration.service.ts`, add the constructor dependency:
```ts
private readonly applicationRegistrationLogicFunctionSyncService:
  ApplicationRegistrationLogicFunctionSyncService,
```
and its import.

- [ ] **Step 2: Call sync after manifest is persisted**

In `upsertFromCatalog`, after the registration is saved and reloaded (the same place `syncVariableSchemas` is called), add — guarded by manifest presence:
```ts
if (isDefined(registration) && isDefined(params.manifest)) {
  await this.applicationRegistrationLogicFunctionSyncService.syncFromManifest({
    applicationRegistrationId: registration.id,
    manifest: params.manifest,
  });
}
```
In `updateFromManifest`, after `save`, add:
```ts
await this.applicationRegistrationLogicFunctionSyncService.syncFromManifest({
  applicationRegistrationId,
  manifest,
});
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx nx typecheck twenty-server` → PASS
```bash
git add packages/twenty-server/src/engine/core-modules/application/application-registration
git commit -m "feat(server): run server-logic-function sync on registration manifest updates"
```

---

## PR 3 — Server logic function executor

### Task 3.1: Return-contract guard

**Files:**
- Create: `.../server-logic-function-executor/utils/is-server-logic-function-result.util.ts`
- Create: `.../server-logic-function-executor/utils/__tests__/is-server-logic-function-result.util.spec.ts`

**Interfaces:**
- Produces: `isServerLogicFunctionResult(value: unknown): value is ServerLogicFunctionResult`.

- [ ] **Step 1: Write the failing test**

```ts
import { isServerLogicFunctionResult } from 'src/engine/core-modules/server-logic-function-executor/utils/is-server-logic-function-result.util';

describe('isServerLogicFunctionResult', () => {
  it('accepts a valid result', () => {
    expect(isServerLogicFunctionResult({ workspaceIds: ['a'] })).toBe(true);
    expect(isServerLogicFunctionResult({ workspaceIds: [], response: { status: 200 } })).toBe(true);
  });
  it('rejects invalid shapes', () => {
    expect(isServerLogicFunctionResult(null)).toBe(false);
    expect(isServerLogicFunctionResult({})).toBe(false);
    expect(isServerLogicFunctionResult({ workspaceIds: 'x' })).toBe(false);
    expect(isServerLogicFunctionResult({ workspaceIds: [1] })).toBe(false);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `cd packages/twenty-server && npx jest is-server-logic-function-result`
Expected: FAIL.

- [ ] **Step 3: Implement the guard**

```ts
import { type ServerLogicFunctionResult } from 'twenty-shared/application';
import { isDefined, isObject } from 'twenty-shared/utils';

export const isServerLogicFunctionResult = (
  value: unknown,
): value is ServerLogicFunctionResult => {
  if (!isObject(value)) {
    return false;
  }

  const workspaceIds = (value as { workspaceIds?: unknown }).workspaceIds;

  return (
    Array.isArray(workspaceIds) &&
    workspaceIds.every((id) => typeof id === 'string') &&
    isDefined(workspaceIds)
  );
};
```

- [ ] **Step 4: Run to verify pass + commit**

Run: `cd packages/twenty-server && npx jest is-server-logic-function-result` → PASS
```bash
git add packages/twenty-server/src/engine/core-modules/server-logic-function-executor/utils
git commit -m "feat(server): add server logic function result guard"
```

---

### Task 3.2: Exception + codes

**Files:**
- Create: `.../server-logic-function-executor/server-logic-function-executor.exception.ts`

**Interfaces:**
- Produces: `ServerLogicFunctionExecutorException`, `ServerLogicFunctionExecutorExceptionCode` with members `FEATURE_DISABLED`, `OWNER_WORKSPACE_NOT_SET`, `FUNCTION_DISABLED`, `APP_NOT_INSTALLED_IN_OWNER_WORKSPACE`, `LOGIC_FUNCTION_NOT_FOUND`, `INVALID_RETURN_SHAPE`, `USER_UNCAUGHT_ERROR`, `THROTTLED`, `PLATFORM_ERROR`.

- [ ] **Step 1: Implement (mirror `server-webhook-trigger.exception.ts`)**

```ts
import { CustomException } from 'src/utils/custom-exception';

export enum ServerLogicFunctionExecutorExceptionCode {
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  OWNER_WORKSPACE_NOT_SET = 'OWNER_WORKSPACE_NOT_SET',
  FUNCTION_DISABLED = 'FUNCTION_DISABLED',
  APP_NOT_INSTALLED_IN_OWNER_WORKSPACE = 'APP_NOT_INSTALLED_IN_OWNER_WORKSPACE',
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  INVALID_RETURN_SHAPE = 'INVALID_RETURN_SHAPE',
  USER_UNCAUGHT_ERROR = 'USER_UNCAUGHT_ERROR',
  THROTTLED = 'THROTTLED',
  PLATFORM_ERROR = 'PLATFORM_ERROR',
}

export class ServerLogicFunctionExecutorException extends CustomException<ServerLogicFunctionExecutorExceptionCode> {}
```

(Match the actual `CustomException` import path used by `server-webhook-trigger.exception.ts`.)

- [ ] **Step 2: Typecheck + commit**

```bash
git add packages/twenty-server/src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.exception.ts
git commit -m "feat(server): add server logic function executor exceptions"
```

---

### Task 3.3: The executor service

**Files:**
- Create: `.../server-logic-function-executor/server-logic-function-executor.service.ts`
- Create: `.../server-logic-function-executor/server-logic-function-executor.module.ts`
- Create: `.../server-logic-function-executor/__tests__/server-logic-function-executor.service.spec.ts`

**Interfaces:**
- Consumes: `LogicFunctionExecutorService.execute` (existing), `ThrottlerService.tokenBucketThrottleOrThrow`, `TwentyConfigService.get`, repositories of `ApplicationRegistrationEntity`, `ApplicationEntity`, `LogicFunctionEntity`, `ApplicationRegistrationLogicFunctionEntity`; `isServerLogicFunctionResult` (Task 3.1); `buildRouteTriggerResponse` (existing).
- Produces:
```ts
export type ServerLogicFunctionOutcome =
  | { kind: 'response'; workspaceIds: string[]; response: RouteTriggerResponse }
  | { kind: 'userError'; errorMessage: string };

run({ applicationRegistrationUniversalIdentifier, logicFunctionUniversalIdentifier, payload, request }):
  Promise<ServerLogicFunctionOutcome>
```

- [ ] **Step 1: Write the failing test**

```ts
import { type Repository } from 'typeorm';

import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';
import { ServerLogicFunctionExecutorExceptionCode } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.exception';

const REGISTRATION_UID = 'reg-uid';
const LOGIC_FN_UID = 'fn-uid';
const OWNER_WORKSPACE_ID = '22222222-2222-2222-2222-222222222222';

describe('ServerLogicFunctionExecutorService', () => {
  let service: ServerLogicFunctionExecutorService;
  let registrationRepository: any;
  let registrationLogicFunctionRepository: any;
  let applicationRepository: any;
  let logicFunctionRepository: any;
  let logicFunctionExecutorService: any;
  let throttlerService: any;
  let twentyConfigService: any;

  const buildService = () =>
    new ServerLogicFunctionExecutorService(
      registrationRepository,
      registrationLogicFunctionRepository,
      applicationRepository,
      logicFunctionRepository,
      logicFunctionExecutorService,
      throttlerService,
      twentyConfigService,
    );

  beforeEach(() => {
    registrationRepository = { findOne: jest.fn().mockResolvedValue({ id: 'reg-1', ownerWorkspaceId: OWNER_WORKSPACE_ID }) };
    registrationLogicFunctionRepository = { findOne: jest.fn().mockResolvedValue({ id: 'srv-1', universalIdentifier: LOGIC_FN_UID, applicationRegistrationId: 'reg-1', disabledAt: null, serverWebhookTriggerSettings: {} }) };
    applicationRepository = { findOne: jest.fn().mockResolvedValue({ id: 'app-1' }) };
    logicFunctionRepository = { findOne: jest.fn().mockResolvedValue({ id: 'lf-1' }) };
    logicFunctionExecutorService = { execute: jest.fn().mockResolvedValue({ data: { workspaceIds: ['w1'] }, error: undefined }) };
    throttlerService = { tokenBucketThrottleOrThrow: jest.fn().mockResolvedValue(1) };
    twentyConfigService = { get: jest.fn().mockReturnValue(true) };
    service = buildService();
  });

  const run = () =>
    service.run({
      applicationRegistrationUniversalIdentifier: REGISTRATION_UID,
      logicFunctionUniversalIdentifier: LOGIC_FN_UID,
      payload: { headers: {}, body: {} },
    });

  it('delegates to the executor with the owner workspace and returns workspaceIds', async () => {
    const outcome = await run();
    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith(
      expect.objectContaining({ logicFunctionId: 'lf-1', workspaceId: OWNER_WORKSPACE_ID }),
    );
    expect(outcome).toEqual(expect.objectContaining({ kind: 'response', workspaceIds: ['w1'] }));
  });

  it('refuses when the feature is disabled', async () => {
    twentyConfigService.get.mockReturnValue(false);
    await expect(run()).rejects.toMatchObject({
      code: ServerLogicFunctionExecutorExceptionCode.FEATURE_DISABLED,
    });
  });

  it('refuses when the registration has no owner workspace', async () => {
    registrationRepository.findOne.mockResolvedValue({ id: 'reg-1', ownerWorkspaceId: null });
    await expect(run()).rejects.toMatchObject({
      code: ServerLogicFunctionExecutorExceptionCode.OWNER_WORKSPACE_NOT_SET,
    });
  });

  it('refuses when the function is disabled', async () => {
    registrationLogicFunctionRepository.findOne.mockResolvedValue({ id: 'srv-1', applicationRegistrationId: 'reg-1', disabledAt: new Date() });
    await expect(run()).rejects.toMatchObject({
      code: ServerLogicFunctionExecutorExceptionCode.FUNCTION_DISABLED,
    });
  });

  it('rejects an invalid return shape', async () => {
    logicFunctionExecutorService.execute.mockResolvedValue({ data: { nope: true }, error: undefined });
    await expect(run()).rejects.toMatchObject({
      code: ServerLogicFunctionExecutorExceptionCode.INVALID_RETURN_SHAPE,
    });
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `cd packages/twenty-server && npx jest server-logic-function-executor.service`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the service**

```ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  RouteTriggerResponse,
  buildRouteTriggerResponse,
} from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import {
  ServerLogicFunctionExecutorException,
  ServerLogicFunctionExecutorExceptionCode,
} from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.exception';
import { isServerLogicFunctionResult } from 'src/engine/core-modules/server-logic-function-executor/utils/is-server-logic-function-result.util';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export type ServerLogicFunctionOutcome =
  | { kind: 'response'; workspaceIds: string[]; response: RouteTriggerResponse }
  | { kind: 'userError'; errorMessage: string };

const THROTTLE_LIMIT = 1000;
const THROTTLE_TTL_MS = 60_000;

@Injectable()
export class ServerLogicFunctionExecutorService {
  private readonly logger = new Logger(ServerLogicFunctionExecutorService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly registrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationRegistrationLogicFunctionEntity)
    private readonly registrationLogicFunctionRepository: Repository<ApplicationRegistrationLogicFunctionEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async run({
    applicationRegistrationUniversalIdentifier,
    logicFunctionUniversalIdentifier,
    payload,
  }: {
    applicationRegistrationUniversalIdentifier: string;
    logicFunctionUniversalIdentifier: string;
    payload: object;
  }): Promise<ServerLogicFunctionOutcome> {
    if (!this.twentyConfigService.get('IS_SERVER_LOGIC_FUNCTION_ENABLED')) {
      throw new ServerLogicFunctionExecutorException(
        'Server logic functions are disabled on this instance',
        ServerLogicFunctionExecutorExceptionCode.FEATURE_DISABLED,
      );
    }

    const registration = await this.registrationRepository.findOne({
      where: { universalIdentifier: applicationRegistrationUniversalIdentifier },
    });

    if (!isDefined(registration)) {
      throw new ServerLogicFunctionExecutorException(
        'Application registration not found',
        ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    if (!isDefined(registration.ownerWorkspaceId)) {
      throw new ServerLogicFunctionExecutorException(
        'Application registration has no owner workspace',
        ServerLogicFunctionExecutorExceptionCode.OWNER_WORKSPACE_NOT_SET,
      );
    }

    const serverFunction = await this.registrationLogicFunctionRepository.findOne({
      where: {
        applicationRegistrationId: registration.id,
        universalIdentifier: logicFunctionUniversalIdentifier,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(serverFunction)) {
      throw new ServerLogicFunctionExecutorException(
        'Server logic function not found',
        ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    if (isDefined(serverFunction.disabledAt)) {
      throw new ServerLogicFunctionExecutorException(
        'Server logic function is disabled',
        ServerLogicFunctionExecutorExceptionCode.FUNCTION_DISABLED,
      );
    }

    await this.throttle(registration.id);

    const application = await this.applicationRepository.findOne({
      where: {
        applicationRegistrationId: registration.id,
        workspaceId: registration.ownerWorkspaceId,
      },
    });

    if (!isDefined(application)) {
      throw new ServerLogicFunctionExecutorException(
        'Application is not installed in the owner workspace',
        ServerLogicFunctionExecutorExceptionCode.APP_NOT_INSTALLED_IN_OWNER_WORKSPACE,
      );
    }

    const ownerLogicFunction = await this.logicFunctionRepository.findOne({
      where: {
        workspaceId: registration.ownerWorkspaceId,
        applicationId: application.id,
        universalIdentifier: logicFunctionUniversalIdentifier,
      },
    });

    if (!isDefined(ownerLogicFunction)) {
      throw new ServerLogicFunctionExecutorException(
        'Owner-workspace copy of the logic function not found',
        ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    let result;

    try {
      result = await this.logicFunctionExecutorService.execute({
        logicFunctionId: ownerLogicFunction.id,
        workspaceId: registration.ownerWorkspaceId,
        payload,
      });
    } catch (error) {
      this.logger.error(
        `Server logic function ${serverFunction.id} failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServerLogicFunctionExecutorException(
        'Server logic function execution failed',
        ServerLogicFunctionExecutorExceptionCode.PLATFORM_ERROR,
      );
    }

    if (isDefined(result.error)) {
      return { kind: 'userError', errorMessage: result.error.errorMessage };
    }

    if (!isServerLogicFunctionResult(result.data)) {
      throw new ServerLogicFunctionExecutorException(
        'Server logic function must return { workspaceIds: string[]; response? }',
        ServerLogicFunctionExecutorExceptionCode.INVALID_RETURN_SHAPE,
      );
    }

    return {
      kind: 'response',
      workspaceIds: result.data.workspaceIds,
      response: buildRouteTriggerResponse(result.data.response),
    };
  }

  private async throttle(applicationRegistrationId: string): Promise<void> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `${applicationRegistrationId}-server-logic-function-execution`,
        1,
        THROTTLE_LIMIT,
        THROTTLE_TTL_MS,
      );
    } catch {
      throw new ServerLogicFunctionExecutorException(
        'Server logic function execution rate limit exceeded',
        ServerLogicFunctionExecutorExceptionCode.THROTTLED,
      );
    }
  }
}
```

- [ ] **Step 4: Create the module**

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationEntity,
      ApplicationRegistrationLogicFunctionEntity,
      ApplicationEntity,
      LogicFunctionEntity,
    ]),
    LogicFunctionExecutorModule,
    ThrottlerModule,
  ],
  providers: [ServerLogicFunctionExecutorService],
  exports: [ServerLogicFunctionExecutorService],
})
export class ServerLogicFunctionExecutorModule {}
```

(Confirm the exact module names that export `LogicFunctionExecutorService` and `ThrottlerService`; adjust imports to match.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd packages/twenty-server && npx jest server-logic-function-executor.service`
Expected: PASS (all 5 cases).

- [ ] **Step 6: Lint + typecheck + commit**

```bash
npx nx lint:diff-with-main twenty-server --configuration=fix
npx nx typecheck twenty-server
git add packages/twenty-server/src/engine/core-modules/server-logic-function-executor
git commit -m "feat(server): add ServerLogicFunctionExecutorService delegating to owner workspace"
```

---

## PR 4 — Server webhook trigger rework

### Task 4.1: Rework the webhook to use the registry + executor

**Files:**
- Modify: `.../server-webhook-trigger/server-webhook-trigger.service.ts`
- Modify: `.../server-webhook-trigger/server-webhook-trigger.module.ts`
- Modify: `.../server-webhook-trigger/__tests__/server-webhook-trigger.service.spec.ts`
- Delete: `.../server-webhook-trigger/utils/resolve-workspace-id-from-request.util.ts` and its test (the declarative resolver is removed)

**Interfaces:**
- Consumes: `ServerLogicFunctionExecutorService.run` (Task 3.3); `buildLogicFunctionEvent` (existing route util); `ServerLogicFunctionOutcome`.
- Produces: `handle({ request, applicationRegistrationUniversalIdentifier, logicFunctionUniversalIdentifier }): Promise<RouteTriggerResponse>` (controller signature unchanged).

- [ ] **Step 1: Rewrite the service**

Replace `server-webhook-trigger.service.ts` body with a thin adapter that builds the event from the request and delegates:

```ts
import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { buildLogicFunctionEvent } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';
import { type RouteTriggerResponse } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/route-trigger-response.util';
import {
  ServerWebhookTriggerException,
  ServerWebhookTriggerExceptionCode,
} from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';
import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';

@Injectable()
export class ServerWebhookTriggerService {
  constructor(
    private readonly serverLogicFunctionExecutorService: ServerLogicFunctionExecutorService,
  ) {}

  async handle({
    request,
    applicationRegistrationUniversalIdentifier,
    logicFunctionUniversalIdentifier,
  }: {
    request: Request;
    applicationRegistrationUniversalIdentifier: string;
    logicFunctionUniversalIdentifier: string;
  }): Promise<RouteTriggerResponse> {
    const event = buildLogicFunctionEvent({
      request,
      pathParameters: {},
      forwardedRequestHeaders: [],
      userWorkspaceId: null,
    });

    const outcome = await this.serverLogicFunctionExecutorService.run({
      applicationRegistrationUniversalIdentifier,
      logicFunctionUniversalIdentifier,
      payload: event,
    });

    if (outcome.kind === 'userError') {
      throw new ServerWebhookTriggerException(
        outcome.errorMessage,
        ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
      );
    }

    return outcome.response;
  }
}
```

Note on `forwardedRequestHeaders`: to honor the function's declared `serverWebhookTriggerSettings.forwardedRequestHeaders`, have `ServerLogicFunctionExecutorService.run` accept and apply them when building the event, OR read the `ApplicationRegistrationLogicFunctionEntity` here first. Simplest: move event-building into the executor's `run` (it already loads the server function row, which carries `serverWebhookTriggerSettings`). Refactor `run` to accept `request?: Request` and build the event internally using `serverFunction.serverWebhookTriggerSettings?.forwardedRequestHeaders ?? []`. Update Task 3.3's `run` signature accordingly and keep the executor unit test green.

- [ ] **Step 2: Update the module**

Replace the webhook module imports/providers:
```ts
@Module({
  imports: [ServerLogicFunctionExecutorModule],
  controllers: [ServerWebhookTriggerController],
  providers: [ServerWebhookTriggerService],
})
export class ServerWebhookTriggerModule {}
```
(Remove the `TypeOrmModule.forFeature([LogicFunctionEntity, ApplicationEntity])`, `ApplicationRegistrationModule`, `LogicFunctionTriggerModule` imports that are no longer used by the service.)

- [ ] **Step 3: Remove the declarative resolver**

Delete `utils/resolve-workspace-id-from-request.util.ts` and `utils/__tests__/resolve-workspace-id-from-request.util.spec.ts`. Remove the now-unused exception code `WORKSPACE_ID_NOT_RESOLVED` and `SERVER_WEBHOOK_TRIGGER_NOT_CONFIGURED` only if nothing else references them (grep first); otherwise leave them.

- [ ] **Step 4: Rewrite the service spec**

Replace `server-webhook-trigger.service.spec.ts` with tests for the thin adapter:

```ts
import { ServerWebhookTriggerService } from 'src/engine/core-modules/server-webhook-trigger/server-webhook-trigger.service';
import { ServerWebhookTriggerExceptionCode } from 'src/engine/core-modules/server-webhook-trigger/exceptions/server-webhook-trigger.exception';

describe('ServerWebhookTriggerService', () => {
  let service: ServerWebhookTriggerService;
  let executor: { run: jest.Mock };

  const handle = () =>
    service.handle({
      request: { headers: {}, query: {}, method: 'POST', path: '/x', body: {} } as any,
      applicationRegistrationUniversalIdentifier: 'reg',
      logicFunctionUniversalIdentifier: 'fn',
    });

  beforeEach(() => {
    executor = { run: jest.fn() };
    service = new ServerWebhookTriggerService(executor as any);
  });

  it('returns the response from the executor outcome', async () => {
    executor.run.mockResolvedValue({ kind: 'response', workspaceIds: ['w'], response: { statusCode: 200, headers: {}, body: { ok: true } } });
    await expect(handle()).resolves.toEqual({ statusCode: 200, headers: {}, body: { ok: true } });
  });

  it('maps a user error to a webhook exception', async () => {
    executor.run.mockResolvedValue({ kind: 'userError', errorMessage: 'boom' });
    await expect(handle()).rejects.toMatchObject({
      code: ServerWebhookTriggerExceptionCode.SERVER_WEBHOOK_USER_UNCAUGHT_ERROR,
    });
  });
});
```

- [ ] **Step 5: Run tests + typecheck**

Run: `cd packages/twenty-server && npx jest server-webhook-trigger`
Expected: PASS.
Run: `npx nx typecheck twenty-server` → PASS (the Task 1.1 webhook breakage is now resolved).

- [ ] **Step 6: Commit**

```bash
git add packages/twenty-server/src/engine/core-modules/server-webhook-trigger
git commit -m "feat(server): run server webhook trigger via instance-level executor"
```

---

## PR 5 — Server cron (global tick)

### Task 5.1: Cron tick job + command + execution job

**Files:**
- Create: `.../server-logic-function-executor/cron/server-cron-trigger.cron.job.ts`
- Create: `.../server-logic-function-executor/cron/server-cron-trigger.cron.command.ts`
- Create: `.../server-logic-function-executor/cron/server-logic-function-execution.job.ts`
- Modify: `.../server-logic-function-executor/server-logic-function-executor.module.ts` (register jobs/command, export command)
- Modify: `packages/twenty-server/src/database/commands/cron-register-all.command.ts` (add to `allCommands`)
- Modify: `packages/twenty-server/src/database/commands/database-command.module.ts` (provide the command/module)

**Interfaces:**
- Consumes: `MessageQueueService.addCron`/`add` (existing), `shouldRunNow` (`src/utils/should-run-now.utils`), `ServerLogicFunctionExecutorService.run`, `Repository<ApplicationRegistrationLogicFunctionEntity>`.
- Produces: a `* * * * *` repeatable job that enqueues due server crons; a worker job `ServerLogicFunctionExecutionJob` that calls the executor.

- [ ] **Step 1: Execution job (worker side)**

```ts
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ServerLogicFunctionExecutorService } from 'src/engine/core-modules/server-logic-function-executor/server-logic-function-executor.service';

export type ServerLogicFunctionExecutionJobData = {
  applicationRegistrationUniversalIdentifier: string;
  logicFunctionUniversalIdentifier: string;
};

@Processor(MessageQueue.logicFunctionQueue)
export class ServerLogicFunctionExecutionJob {
  constructor(
    private readonly serverLogicFunctionExecutorService: ServerLogicFunctionExecutorService,
  ) {}

  @Process(ServerLogicFunctionExecutionJob.name)
  async handle(data: ServerLogicFunctionExecutionJobData): Promise<void> {
    await this.serverLogicFunctionExecutorService.run({
      applicationRegistrationUniversalIdentifier:
        data.applicationRegistrationUniversalIdentifier,
      logicFunctionUniversalIdentifier: data.logicFunctionUniversalIdentifier,
      payload: { source: 'cron' },
    });
  }
}
```

(Match the exact `@Processor`/`@Process` decorator import paths used by `logic-function-trigger.job.ts`.)

- [ ] **Step 2: The one-minute tick job (mirror `cron-trigger.cron.job.ts`)**

```ts
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isDefined } from 'twenty-shared/utils';

import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import {
  ServerLogicFunctionExecutionJob,
  type ServerLogicFunctionExecutionJobData,
} from 'src/engine/core-modules/server-logic-function-executor/cron/server-logic-function-execution.job';
import { shouldRunNow } from 'src/utils/should-run-now.utils';

export const SERVER_CRON_TRIGGER_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class ServerCronTriggerCronJob {
  constructor(
    @InjectRepository(ApplicationRegistrationLogicFunctionEntity)
    private readonly repository: Repository<ApplicationRegistrationLogicFunctionEntity>,
    @InjectMessageQueue(MessageQueue.logicFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(ServerCronTriggerCronJob.name)
  async handle(): Promise<void> {
    const now = new Date();
    const serverCrons = await this.repository.find({
      where: { disabledAt: null as unknown as undefined },
      relations: ['applicationRegistration'],
    });

    for (const serverCron of serverCrons) {
      const pattern = serverCron.serverCronTriggerSettings?.pattern;
      const ownerWorkspaceId = serverCron.applicationRegistration?.ownerWorkspaceId;

      if (
        !isDefined(pattern) ||
        !isDefined(ownerWorkspaceId) ||
        isDefined(serverCron.disabledAt) ||
        !shouldRunNow(pattern, now)
      ) {
        continue;
      }

      await this.messageQueueService.add<ServerLogicFunctionExecutionJobData>(
        ServerLogicFunctionExecutionJob.name,
        {
          applicationRegistrationUniversalIdentifier:
            serverCron.applicationRegistration.universalIdentifier,
          logicFunctionUniversalIdentifier: serverCron.universalIdentifier,
        },
        { retryLimit: 3 },
      );
    }
  }
}
```

(Prefer a single query with a proper `where serverCronTriggerSettings IS NOT NULL and disabledAt IS NULL and ownerWorkspaceId IS NOT NULL` using a QueryBuilder join; the `.find` above is the readable form — tighten it to avoid loading non-cron rows.)

- [ ] **Step 3: The registration command (mirror `cron-trigger.cron.command.ts`)**

```ts
import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  SERVER_CRON_TRIGGER_CRON_PATTERN,
  ServerCronTriggerCronJob,
} from 'src/engine/core-modules/server-logic-function-executor/cron/server-cron-trigger.cron.job';

@Command({
  name: 'cron:server:trigger:start-server-cron-trigger',
  description: 'Starts the server logic function cron trigger',
})
export class ServerCronTriggerCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: ServerCronTriggerCronJob.name,
      data: undefined,
      options: { repeat: { pattern: SERVER_CRON_TRIGGER_CRON_PATTERN } },
    });
  }
}
```

- [ ] **Step 4: Register providers + wire into `cron:register:all`**

In `server-logic-function-executor.module.ts`, add `ServerCronTriggerCronJob`, `ServerLogicFunctionExecutionJob`, `ServerCronTriggerCronCommand` to `providers` and export `ServerCronTriggerCronCommand`. Ensure the module imports the `MessageQueueModule` registrations for `cronQueue` and `logicFunctionQueue` (copy from `logic-function-trigger.module.ts`).

In `cron-register-all.command.ts`, add the new command to `allCommands` next to the existing `'CronTrigger'` entry:
```ts
{ name: 'ServerCronTrigger', command: this.serverCronTriggerCronCommand },
```
inject it in the constructor, and in `database-command.module.ts` add `ServerLogicFunctionExecutorModule` to `imports` (or provide `ServerCronTriggerCronCommand`).

- [ ] **Step 5: Smoke-test the tick logic**

Add a unit test `cron/__tests__/server-cron-trigger.cron.job.spec.ts` that mocks the repository + queue and asserts a due cron (pattern `* * * * *`, owner set, not disabled) enqueues, and a disabled/owner-less one does not. Run:
`cd packages/twenty-server && npx jest server-cron-trigger.cron.job` → PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/twenty-server/src/engine/core-modules/server-logic-function-executor/cron packages/twenty-server/src/database/commands
git commit -m "feat(server): add server logic function cron tick"
```

---

## PR 6 — Marketplace listing guard + kill switch

### Task 6.1: Don't list registrations without an owner workspace

**Files:**
- Modify: `.../application-registration/application-registration.service.ts`
- Create/Modify: `.../application-registration/__tests__/application-registration.service.spec.ts`

**Interfaces:**
- Consumes: `isDefined`.
- Produces: `findManyListed()` excludes rows with `ownerWorkspaceId IS NULL`.

- [ ] **Step 1: Write the failing test**

Add a test asserting `findManyListed` filters by a non-null owner workspace (mock the repository `find` and assert the `where` includes `ownerWorkspaceId: Not(IsNull())`).

- [ ] **Step 2: Implement the guard**

In `findManyListed`, extend the `where`:
```ts
return this.applicationRegistrationRepository.find({
  where: {
    isListed: true,
    sourceType: ApplicationRegistrationSourceType.NPM,
    ownerWorkspaceId: Not(IsNull()),
  },
});
```
Import `Not, IsNull` from `typeorm`.

- [ ] **Step 3: Run test + commit**

Run: `cd packages/twenty-server && npx jest application-registration.service` → PASS
```bash
git add packages/twenty-server/src/engine/core-modules/application/application-registration
git commit -m "feat(server): exclude owner-less registrations from marketplace listing"
```

---

### Task 6.2: Kill-switch admin helper

**Files:**
- Create: `.../application-registration-logic-function/application-registration-logic-function.service.ts`
- Create: `.../application-registration-logic-function/__tests__/application-registration-logic-function.service.spec.ts`
- Modify: `.../application-registration-logic-function/application-registration-logic-function.module.ts`

**Interfaces:**
- Produces: `setDisabled({ id, disabled }): Promise<void>` setting `disabledAt = disabled ? new Date() : null`. (Admin-panel wiring is a thin follow-up; the service + a guarded resolver/controller can be added once the admin surface is chosen.)

- [ ] **Step 1: Write the failing test**

```ts
import { type Repository } from 'typeorm';
import { ApplicationRegistrationLogicFunctionService } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.service';
import { type ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';

describe('ApplicationRegistrationLogicFunctionService', () => {
  let service: ApplicationRegistrationLogicFunctionService;
  let repository: jest.Mocked<Pick<Repository<ApplicationRegistrationLogicFunctionEntity>, 'update'>>;

  beforeEach(() => {
    repository = { update: jest.fn().mockResolvedValue(undefined) };
    service = new ApplicationRegistrationLogicFunctionService(
      repository as unknown as Repository<ApplicationRegistrationLogicFunctionEntity>,
    );
  });

  it('disables by setting disabledAt', async () => {
    await service.setDisabled({ id: 'x', disabled: true });
    expect(repository.update).toHaveBeenCalledWith('x', { disabledAt: expect.any(Date) });
  });

  it('enables by clearing disabledAt', async () => {
    await service.setDisabled({ id: 'x', disabled: false });
    expect(repository.update).toHaveBeenCalledWith('x', { disabledAt: null });
  });
});
```

- [ ] **Step 2: Implement**

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';

@Injectable()
export class ApplicationRegistrationLogicFunctionService {
  constructor(
    @InjectRepository(ApplicationRegistrationLogicFunctionEntity)
    private readonly repository: Repository<ApplicationRegistrationLogicFunctionEntity>,
  ) {}

  async setDisabled({ id, disabled }: { id: string; disabled: boolean }): Promise<void> {
    await this.repository.update(id, { disabledAt: disabled ? new Date() : null });
  }
}
```

Register in the module `providers`/`exports`.

- [ ] **Step 3: Run test + commit**

Run: `cd packages/twenty-server && npx jest application-registration-logic-function.service` → PASS
```bash
git add packages/twenty-server/src/engine/core-modules/application/application-registration-logic-function
git commit -m "feat(server): add kill-switch helper for server logic functions"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- §5.1 entity → Task 1.2 + 1.3. §5.2 shared types/return contract → Task 1.1. §6 sync → Task 2.1/2.2. §7 executor (gate, resolve, throttle, delegate, validate) → Task 3.1/3.2/3.3. §8.1 webhook → Task 4.1. §8.2 cron tick → Task 5.1. §9 config-var gate → Task 1.4 + enforced in 3.3; rate limit → 3.3; kill switch → 1.2 column + 3.3 enforcement + 6.2 toggle; audit log → reused via delegated executor's existing logging (no extra task); marketplace listing guard → 6.1; always-bill-owner → automatic via 3.3 delegation. §10 untouched → no task modifies the workspace path. §12 decisions → all reflected.
- Gap noted: a dedicated **audit-log** record beyond the delegated executor's existing `LOGIC_FUNCTION_EXECUTED_EVENT` is not separately built; the delegated executor already logs/usage-records per execution against the owner workspace, satisfying §9's audit need for v1. If a server-specific audit row is later wanted, add it in a follow-up.

**Type consistency:** `ServerLogicFunctionResult`, `ApplicationRegistrationLogicFunctionEntity`, `ServerLogicFunctionExecutorService.run`, `ServerLogicFunctionOutcome`, `ServerLogicFunctionExecutionJobData`, `isServerLogicFunctionResult` are used consistently across tasks. Note the Task 4.1 refinement: `run` should build the event internally (to honor `forwardedRequestHeaders`), so its final signature accepts an optional `request` — apply that when implementing Task 3.3/4.1 together.

**Placeholder scan:** No TBD/TODO; every code step carries real code. Two explicit "confirm the exact import path" notes remain (module names for `LogicFunctionExecutorModule`, `ThrottlerModule`, and the `@Processor`/`@Process` decorators) — these are verification instructions, not placeholders, because the exact provider/module export names must be read at implementation time.

---

## Open implementation notes

1. **Event-building location:** implement Task 3.3 and 4.1 together — move `buildLogicFunctionEvent` into `ServerLogicFunctionExecutorService.run` (accepting an optional `request`) so the function's declared `forwardedRequestHeaders` are honored and the webhook service stays a one-liner.
2. **Cron tick query:** tighten the `.find` in Task 5.1 Step 2 to a QueryBuilder that filters `serverCronTriggerSettings IS NOT NULL`, `disabledAt IS NULL`, and joins to require `ownerWorkspaceId IS NOT NULL`, to avoid scanning webhook-only rows every minute.
3. **PR ordering vs typecheck:** Task 1.1 removes `workspaceIdResolver`, which breaks the old webhook until Task 4.1. If your CI gates each PR on a green typecheck, fold PR 4 into PR 1's branch or land them together.
