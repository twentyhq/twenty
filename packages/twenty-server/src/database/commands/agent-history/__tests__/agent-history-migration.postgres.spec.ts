import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { withWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AddChatMessageSenderFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-instance-command-fast-1790171503074-add-chat-message-sender';
import { AgentHistoryMigrationDataService } from 'src/database/commands/agent-history/agent-history-migration-data.service';
import { AgentHistoryMigrationValidationService } from 'src/database/commands/agent-history/agent-history-migration-validation.service';
import { AdminPanelChatService } from 'src/engine/core-modules/admin-panel/services/admin-panel-chat.service';
import { AgentHistoryCleanupCommand } from 'src/database/commands/agent-history/agent-history-cleanup.command';
import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { computeFlatIndexFieldColumnNames } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';
import { updateAgentChatThreadUsage } from 'src/engine/metadata-modules/ai/ai-chat/utils/update-agent-chat-thread-usage.util';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AdminPanelGlobalChatThreadsService } from 'src/engine/core-modules/admin-panel/services/admin-panel-global-chat-threads.service';
import { AdminChatThreadScope } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-scope.enum';
import { AdminChatThreadSortDirection } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-direction.enum';
import { AdminChatThreadSortField } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-field.enum';
import { AgentHistoryLifecycleService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-lifecycle.service';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace-data-source';
import { WorkspaceSchemaTableManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-table-manager.service';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { DataSource, IsNull, type Repository } from 'typeorm';
import { Pool } from 'pg';
import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryMigrationService } from 'src/database/commands/agent-history/agent-history-migration.service';
import { AGENT_HISTORY_TABLES } from 'src/database/commands/agent-history/agent-history-tables.constant';
import { AGENT_HISTORY_TEST_SCHEMA } from 'src/database/commands/agent-history/__tests__/agent-history-test-schema.constant';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const DATABASE_URL = process.env.AGENT_HISTORY_TEST_DATABASE_URL;
const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const OWNER_ID = '20202020-2222-4222-8222-222222222222';
const THREAD_ID = '20202020-3333-4333-8333-333333333333';
const TURN_ID = '20202020-4444-4444-8444-444444444444';
const MESSAGE_ID = '20202020-5555-4555-8555-555555555555';
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);

(DATABASE_URL ? describe : describe.skip)(
  'agent history migration on PostgreSQL',
  () => {
    const dataSource = new DataSource({
      type: 'postgres',
      url: DATABASE_URL,
      entities: [],
      synchronize: false,
    });
    const storage = new AgentHistoryStorageService(dataSource);
    const migration = new AgentHistoryMigrationService(
      dataSource,
      storage,
      new AgentHistoryMigrationDataService(),
      new AgentHistoryMigrationValidationService(),
    );
    const lifecycle = new AgentHistoryLifecycleService(dataSource, storage);
    const pool = new Pool({ connectionString: DATABASE_URL });
    const { allFlatEntityMaps: metadata } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        workspaceId: WORKSPACE_ID,
        now: new Date().toISOString(),
        twentyStandardApplicationId: OWNER_ID,
      });
    for (const object of Object.values(
      metadata.flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      object.fieldIds = Object.values(
        metadata.flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((field) => field.objectMetadataId === object.id)
        .map((field) => field.id);
    }
    const emitDatabaseBatchEvent = jest.fn();
    const workspaceDataSourceOptions = {
      pool,
      authContext: buildSystemAuthContext(WORKSPACE_ID),
      objectPermissionsByRoleId: {},
      internalContext: {
        workspaceId: WORKSPACE_ID,
        flatObjectMetadataMaps: metadata.flatObjectMetadataMaps,
        flatFieldMetadataMaps: metadata.flatFieldMetadataMaps,
        flatIndexMaps: metadata.flatIndexMaps,
        flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
        flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
        objectIdByNameSingular: buildObjectIdByNameMaps(
          metadata.flatObjectMetadataMaps,
        ).idByNameSingular,
        featureFlagsMap: {} as Record<FeatureFlagKey, boolean>,
        billingEntitlements: {},
        isRecordSharingEnabled: false,
        userWorkspaceRoleMap: {},
        apiKeyRoleMap: {},
        eventEmitterService: { emitDatabaseBatchEvent },
        recordStock: {
          assertRecordStockAvailable: jest.fn().mockResolvedValue(undefined),
          acquireRecordStock: jest.fn().mockResolvedValue(undefined),
          releaseRecordStock: jest.fn().mockResolvedValue(undefined),
        },
        coreDataSource: dataSource,
      },
    };
    const createOrm = (maps = metadata) => {
      const options = {
        ...workspaceDataSourceOptions,
        internalContext: {
          ...workspaceDataSourceOptions.internalContext,
          flatObjectMetadataMaps: maps.flatObjectMetadataMaps,
          flatFieldMetadataMaps: maps.flatFieldMetadataMaps,
        },
      };
      const workspaceDataSource = new WorkspaceDataSource(options);
      return {
        executeInWorkspaceContext: async <TResult>(
          work: () => Promise<TResult>,
        ) =>
          withWorkspaceContext(
            {
              ...options.internalContext,
              authContext: options.authContext,
              permissionsPerRoleId: {},
            },
            work,
          ),
        getRepository:
          workspaceDataSource.getRepository.bind(workspaceDataSource),
      };
    };
    const orm = createOrm();
    const threads = new AgentHistoryRepository<AgentChatThreadEntity>(
      'agentChatThread',
      storage,
      orm,
    );
    const messages = new AgentHistoryRepository<AgentMessageEntity>(
      'agentMessage',
      storage,
      orm,
    );

    const prepareLegacyMessages = async (
      missingFields: ('senderUserWorkspaceId' | 'senderApplicationId')[] = [
        'senderUserWorkspaceId',
        'senderApplicationId',
      ],
    ) => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const legacyMetadata = structuredClone(metadata);
      const messageObject =
        legacyMetadata.flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentMessage.universalIdentifier
        ]!;
      for (const name of missingFields) {
        const identifier =
          STANDARD_OBJECTS.agentMessage.fields[name].universalIdentifier;
        const field =
          legacyMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
            identifier
          ]!;
        delete legacyMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
          identifier
        ];
        delete legacyMetadata.flatFieldMetadataMaps.universalIdentifierById[
          field.id
        ];
        messageObject.fieldIds = messageObject.fieldIds.filter(
          (id) => id !== field.id,
        );
        await dataSource.query(
          `ALTER TABLE "${SCHEMA}"."agentMessage" DROP COLUMN "${name}"`,
        );
      }
      return new AgentHistoryRepository<AgentMessageEntity>(
        'agentMessage',
        storage,
        createOrm(legacyMetadata),
      );
    };

    const readRoute = async () => {
      const runner = dataSource.createQueryRunner();
      try {
        await runner.connect();
        return (await storage.readState(runner, WORKSPACE_ID)).storage;
      } finally {
        await runner.release();
      }
    };

    const createChatService = (messageRepository: typeof messages) =>
      new AgentChatService(
        threads,
        new AgentHistoryRepository<AgentTurnEntity>('agentTurn', storage, orm),
        messageRepository,
        new AgentHistoryRepository<AgentMessagePartEntity>(
          'agentMessagePart',
          storage,
          orm,
        ),
        {} as never,
        {} as never,
        { broadcast: jest.fn().mockResolvedValue(undefined) } as never,
        {} as never,
        {
          getThreadWithAccess: ({
            workspaceId,
            threadId,
          }: {
            workspaceId: string;
            threadId: string;
          }) => threads.findOne(workspaceId, { where: { id: threadId } }),
          getPermissions: jest.fn().mockResolvedValue({ canRead: true }),
        } as never,
      );

    const createActorService = (messageRepository: typeof messages) =>
      new AgentChatActorService(
        messageRepository,
        threads,
        createChatService(messageRepository),
        {} as never,
        {} as never,
        {} as never,
      );

    beforeAll(async () => {
      jest.useRealTimers();
      Logger.overrideLogger(false);
      if (new URL(DATABASE_URL!).pathname !== '/agent_history_migration_test')
        throw new Error(
          'Use the isolated agent_history_migration_test database',
        );
      await dataSource.initialize();
      await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    });
    afterAll(async () => {
      await pool.end();
      if (dataSource.isInitialized) await dataSource.destroy();
    });

    beforeEach(async () => {
      await dataSource.query(`DROP SCHEMA IF EXISTS "${SCHEMA}" CASCADE`);
      await dataSource.query('DROP SCHEMA IF EXISTS core CASCADE');
      await dataSource.query(`CREATE SCHEMA core; CREATE SCHEMA "${SCHEMA}"`);
      await dataSource.query(
        `CREATE TYPE core."agentMessage_role_enum" AS ENUM ('user', 'assistant', 'system'); CREATE TYPE core."agentMessage_status_enum" AS ENUM ('queued', 'sent')`,
      );
      await dataSource.query(
        `CREATE TABLE core."keyValuePair" ("key" text, "workspaceId" uuid, "userId" uuid, "applicationId" uuid, "type" text, "value" jsonb, "updatedAt" timestamptz DEFAULT now()); CREATE UNIQUE INDEX state_key ON core."keyValuePair" ("key", "workspaceId") WHERE "userId" IS NULL AND "applicationId" IS NULL`,
      );
      for (const ddl of AGENT_HISTORY_TEST_SCHEMA) await dataSource.query(ddl);
      const senderRunner = dataSource.createQueryRunner();
      try {
        await senderRunner.connect();
        await new AddChatMessageSenderFastInstanceCommand().up(senderRunner);
      } finally {
        await senderRunner.release();
      }
      await dataSource.query(
        'CREATE TABLE core."userWorkspace" (id uuid PRIMARY KEY, "workspaceId" uuid, "userId" uuid); CREATE TABLE core.file (id uuid PRIMARY KEY, "workspaceId" uuid)',
      );
      await dataSource.query(
        'INSERT INTO core."userWorkspace" (id, "workspaceId") VALUES ($1, $2)',
        [OWNER_ID, WORKSPACE_ID],
      );
      await dataSource.query(
        'CREATE UNIQUE INDEX global_state_key ON core."keyValuePair" (key) WHERE "workspaceId" IS NULL AND "userId" IS NULL AND "applicationId" IS NULL',
      );
      await dataSource.query(
        'CREATE TABLE core.workspace (id uuid PRIMARY KEY, "displayName" text, "allowImpersonation" boolean, "deletedAt" timestamptz); CREATE TABLE core."user" (id uuid PRIMARY KEY, email text, "firstName" text, "lastName" text)',
      );
      await dataSource.query(
        'INSERT INTO core.workspace VALUES ($1, $2, true, null)',
        [WORKSPACE_ID, 'Test tenant'],
      );
      const runner = dataSource.createQueryRunner();
      await runner.connect();
      try {
        for (const table of AGENT_HISTORY_TABLES) {
          const object = Object.values(
            metadata.flatObjectMetadataMaps.byUniversalIdentifier,
          )
            .filter(isDefined)
            .find((object) => object.nameSingular === table.name)!;
          const fields = Object.values(
            metadata.flatFieldMetadataMaps.byUniversalIdentifier,
          )
            .filter(isDefined)
            .filter((field) => field.objectMetadataId === object.id);
          await new WorkspaceSchemaTableManagerService().createTable({
            queryRunner: runner,
            schemaName: SCHEMA,
            tableName: table.name,
            columnDefinitions: fields.flatMap((field) =>
              generateColumnDefinitions({
                flatFieldMetadata: field,
                flatObjectMetadata: object,
                workspaceId: WORKSPACE_ID,
              }),
            ),
          });
        }
        for (const index of Object.values(
          metadata.flatIndexMaps.byUniversalIdentifier,
        ).filter(isDefined)) {
          const object = Object.values(
            metadata.flatObjectMetadataMaps.byUniversalIdentifier,
          )
            .filter(isDefined)
            .find((object) => object.id === index.objectMetadataId)!;
          if (
            !AGENT_HISTORY_TABLES.some(
              (table) => table.name === object.nameSingular,
            )
          )
            continue;
          await new WorkspaceSchemaIndexManagerService().createIndex({
            queryRunner: runner,
            schemaName: SCHEMA,
            tableName: object.nameSingular,
            index: {
              name: index.name,
              isUnique: index.isUnique,
              where: index.indexWhereClause ?? undefined,
              columns: computeFlatIndexFieldColumnNames({
                flatIndexFieldMetadatas: index.flatIndexFieldMetadatas,
                flatFieldMetadataMaps: metadata.flatFieldMetadataMaps,
              }),
            },
          });
        }
        for (const [child, column, parent] of [
          ['agentTurn', 'threadId', 'agentChatThread'],
          ['agentMessage', 'threadId', 'agentChatThread'],
          ['agentMessage', 'turnId', 'agentTurn'],
          ['agentMessagePart', 'messageId', 'agentMessage'],
          ['agentTurnEvaluation', 'turnId', 'agentTurn'],
        ]) {
          await runner.query(
            `ALTER TABLE "${SCHEMA}"."${child}" ADD FOREIGN KEY ("${column}") REFERENCES "${SCHEMA}"."${parent}" (id) ON DELETE CASCADE`,
          );
        }
      } finally {
        await runner.release();
      }
      emitDatabaseBatchEvent.mockClear();
      await dataSource.query(
        `INSERT INTO core."agentChatThread" (id, "workspaceId", "userWorkspaceId", title, "totalInputCredits", "deletedAt") VALUES ($1, $2, $3, 'Private archived chat', 9007199254740993, '2026-01-01T00:00:00Z')`,
        [THREAD_ID, WORKSPACE_ID, OWNER_ID],
      );
      await dataSource.query(
        `INSERT INTO core."agentTurn" (id, "workspaceId", "threadId") VALUES ($1, $2, $3)`,
        [TURN_ID, WORKSPACE_ID, THREAD_ID],
      );
      await dataSource.query(
        `INSERT INTO core."agentMessage" (id, "workspaceId", "threadId", "turnId", role, "isHidden") VALUES ($1, $2, $3, $4, 'user', true)`,
        [MESSAGE_ID, WORKSPACE_ID, THREAD_ID, TURN_ID],
      );
      await dataSource.query(
        `INSERT INTO core."agentMessagePart" ("workspaceId", "messageId", "orderIndex", type, "textContent") VALUES ($1, $2, 0, 'text', 'Hidden setup context')`,
        [WORKSPACE_ID, MESSAGE_ID],
      );
      await dataSource.query(
        `INSERT INTO core."agentTurnEvaluation" ("workspaceId", "turnId", score, comment) VALUES ($1, $2, 100, 'Evaluation')`,
        [WORKSPACE_ID, TURN_ID],
      );
    });

    it('can migrate and roll back 2.42 history before the sender columns exist', async () => {
      await dataSource.query(
        'ALTER TABLE core."agentMessage" DROP COLUMN "senderUserWorkspaceId", DROP COLUMN "senderApplicationId"',
      );
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      expect(
        await dataSource.query(
          `SELECT "senderUserWorkspaceId", "senderApplicationId" FROM "${SCHEMA}"."agentMessage"`,
        ),
      ).toEqual([{ senderUserWorkspaceId: null, senderApplicationId: null }]);
      await migration.migrate({ workspaceId: WORKSPACE_ID, target: 'core' });
      expect(
        await dataSource.query('SELECT id FROM core."agentMessage"'),
      ).toEqual([{ id: MESSAGE_ID }]);
    });

    it('preserves sender and application identity when moving attributed history in either direction', async () => {
      await dataSource.query(
        'UPDATE core."agentMessage" SET "senderUserWorkspaceId" = $1, "senderApplicationId" = $2',
        [OWNER_ID, THREAD_ID],
      );
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await migration.migrate({ workspaceId: WORKSPACE_ID, target: 'core' });
      expect(
        await dataSource.query(
          'SELECT "senderUserWorkspaceId", "senderApplicationId" FROM core."agentMessage"',
        ),
      ).toEqual([
        { senderUserWorkspaceId: OWNER_ID, senderApplicationId: THREAD_ID },
      ]);
    });

    it('refuses rollback before clearing data if the legacy schema would discard sender identity', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await dataSource.query(
        `UPDATE "${SCHEMA}"."agentMessage" SET "senderUserWorkspaceId" = $1`,
        [OWNER_ID],
      );
      await dataSource.query(
        'ALTER TABLE core."agentMessage" DROP COLUMN "senderUserWorkspaceId", DROP COLUMN "senderApplicationId"',
      );
      await expect(
        migration.migrate({ workspaceId: WORKSPACE_ID, target: 'core' }),
      ).rejects.toThrow('Run the 2.43 instance upgrade');
      expect(
        await dataSource.query('SELECT id FROM core."agentMessage"'),
      ).toEqual([{ id: MESSAGE_ID }]);
      expect(
        await dataSource.query(
          `SELECT "senderUserWorkspaceId" FROM "${SCHEMA}"."agentMessage"`,
        ),
      ).toEqual([{ senderUserWorkspaceId: OWNER_ID }]);
    });

    it('refuses rollback only while a record is still linked to a chat thread', async () => {
      const validation = new AgentHistoryMigrationValidationService();
      const runner = dataSource.createQueryRunner();
      const table = `"${SCHEMA}"."agentChatThreadTarget"`;

      await runner.connect();
      try {
        await runner.query(
          `CREATE TABLE ${table} (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "threadId" uuid, "targetPersonId" uuid, "targetPetId" uuid, "deletedAt" timestamptz)`,
        );
        // What destroying a custom record leaves behind: its leg set to null.
        await runner.query(`INSERT INTO ${table} ("threadId") VALUES ($1)`, [
          THREAD_ID,
        ]);
        await expect(
          validation.assertNoThreadTargets({
            runner,
            workspaceId: WORKSPACE_ID,
          }),
        ).resolves.toBeUndefined();

        await runner.query(
          `INSERT INTO ${table} ("threadId", "targetPetId") VALUES ($1, $2)`,
          [THREAD_ID, MESSAGE_ID],
        );
        await expect(
          validation.assertNoThreadTargets({
            runner,
            workspaceId: WORKSPACE_ID,
          }),
        ).rejects.toThrow(/Detach them before rolling agent history back/);
      } finally {
        await runner.release();
      }
    });

    it('copies all five tables, exact credits and archive state before changing the route', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
        batchSize: 1,
      });
      const rows = await dataSource.query(
        `SELECT "totalInputCredits", "archivedAt" FROM "${SCHEMA}"."agentChatThread"`,
      );
      expect(rows[0].totalInputCredits).toBe('9007199254740993');
      expect(rows[0].archivedAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
      expect(await readRoute()).toBe('workspace');
      for (const table of AGENT_HISTORY_TABLES) {
        expect(
          (
            await dataSource.query(
              `SELECT count(*) FROM "${SCHEMA}"."${table.name}"`,
            )
          )[0].count,
        ).toBe('1');
      }
    });

    it('retains the write fence after a crash and resumes committed batches', async () => {
      const originalTimestamp = new Date('2020-01-02T03:04:05.000Z');
      await dataSource.query(
        'UPDATE core."agentChatThread" SET "updatedAt" = $1',
        [originalTimestamp],
      );
      const writeState = storage.writeState.bind(storage);
      const injectedCrash = jest
        .spyOn(storage, 'writeState')
        .mockImplementation(async (runner, workspaceId, state) => {
          if (
            state.migration?.phase === 'copying' &&
            state.migration.tableIndex === 1
          )
            throw new Error('Injected process failure');
          await writeState(runner, workspaceId, state);
        });
      await expect(
        migration.migrate({
          workspaceId: WORKSPACE_ID,
          target: 'workspace',
          batchSize: 1,
        }),
      ).rejects.toThrow('Injected process failure');
      injectedCrash.mockRestore();
      const operation = jest.fn();
      await expect(storage.run(WORKSPACE_ID, operation)).rejects.toThrow(
        'being migrated',
      );
      expect(operation).not.toHaveBeenCalled();
      expect(
        (
          await dataSource.query(
            `SELECT count(*) FROM "${SCHEMA}"."agentChatThread"`,
          )
        )[0].count,
      ).toBe('1');
      // Replay the already inserted thread to exercise ON CONFLICT and timestamps.
      await dataSource.query(
        `UPDATE core."keyValuePair" SET value = jsonb_set(value, '{migration,lastId}', 'null') WHERE "workspaceId" = $1`,
        [WORKSPACE_ID],
      );
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
        batchSize: 1,
      });
      expect(
        (
          await dataSource.query(
            `SELECT "updatedAt" FROM "${SCHEMA}"."agentChatThread"`,
          )
        )[0].updatedAt,
      ).toEqual(originalTimestamp);
      expect(await readRoute()).toBe('workspace');
    });

    it('rolls back new writes and deletions rather than selecting the stale core snapshot', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
        batchSize: 1,
      });
      await dataSource.query(
        `UPDATE "${SCHEMA}"."agentChatThread" SET title = 'Updated after cutover'`,
      );
      await dataSource.query(`DELETE FROM "${SCHEMA}"."agentTurnEvaluation"`);
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'core',
        batchSize: 1,
      });
      expect(
        (await dataSource.query('SELECT title FROM core."agentChatThread"'))[0]
          .title,
      ).toBe('Updated after cutover');
      expect(
        (
          await dataSource.query(
            'SELECT count(*) FROM core."agentTurnEvaluation"',
          )
        )[0].count,
      ).toBe('0');
      expect(await readRoute()).toBe('core');
    });

    it('refuses runtime access to history still stored in core', async () => {
      await expect(
        threads.find(WORKSPACE_ID, { where: { id: THREAD_ID } }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(
        (
          await dataSource.query(
            `SELECT count(*) FROM "${SCHEMA}"."agentChatThread"`,
          )
        )[0].count,
      ).toBe('0');
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      expect(
        (await threads.find(WORKSPACE_ID, { where: { id: THREAD_ID } })).map(
          ({ id }) => id,
        ),
      ).toEqual([THREAD_ID]);
    });

    it('refuses cutover while a stream is active', async () => {
      await dataSource.query(
        `UPDATE core."agentChatThread" SET "activeStreamId" = 'running'`,
      );
      await expect(
        migration.migrate({ workspaceId: WORKSPACE_ID, target: 'workspace' }),
      ).rejects.toThrow('streams are still active');
      expect(await readRoute()).toBe('core');
    });

    it('serializes competing migration runners', async () => {
      const runner = dataSource.createQueryRunner();
      await runner.connect();
      const key = `${AGENT_HISTORY_STORAGE_KEY}:runner:${WORKSPACE_ID}`;
      await runner.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [
        key,
      ]);
      try {
        await expect(
          migration.migrate({ workspaceId: WORKSPACE_ID, target: 'workspace' }),
        ).rejects.toThrow('already running');
      } finally {
        await runner.query(
          'SELECT pg_advisory_unlock(hashtextextended($1, 0))',
          [key],
        );
        await runner.release();
      }
    });
    it('uses workspace ORM reads, archives and atomic stream claims without emitting generic events', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      expect(
        await threads.find(WORKSPACE_ID, { where: { deletedAt: IsNull() } }),
      ).toEqual([]);
      const archived = await threads.findOneOrFail(WORKSPACE_ID, {
        where: { id: THREAD_ID },
      });
      expect(archived.deletedAt).toEqual(new Date('2026-01-01T00:00:00Z'));
      expect(archived.createdAt).toBeInstanceOf(Date);
      expect(archived.activeStreamId).toBeNull();
      expect(archived.pendingQuestionMessageId).toBeNull();
      const selected = await threads.findOneOrFail(WORKSPACE_ID, {
        where: { id: THREAD_ID },
        select: ['id', 'deletedAt', 'activeStreamId'],
      });
      expect(selected.deletedAt).toEqual(new Date('2026-01-01T00:00:00Z'));
      expect(selected.activeStreamId).toBeNull();
      const selectedWithObject = await threads.findOneOrFail(WORKSPACE_ID, {
        where: { id: THREAD_ID },
        select: { id: true, deletedAt: true },
      });
      expect(selectedWithObject.deletedAt).toEqual(
        new Date('2026-01-01T00:00:00Z'),
      );
      await threads.update(
        WORKSPACE_ID,
        { id: THREAD_ID },
        { deletedAt: null },
      );
      expect(
        await threads.count(WORKSPACE_ID, { where: { deletedAt: IsNull() } }),
      ).toBe(1);
      const results = await Promise.all(
        ['first', 'second'].map((stream) =>
          threads.update(
            WORKSPACE_ID,
            {
              id: THREAD_ID,
              activeStreamId: IsNull(),
              pendingQuestionMessageId: IsNull(),
            },
            { activeStreamId: stream },
          ),
        ),
      );
      expect(results.map((result) => result.affected).sort()).toEqual([0, 1]);
      const message = await messages.findOneOrFail(WORKSPACE_ID, {
        where: { id: MESSAGE_ID },
        relations: { parts: true },
      });
      expect(message.parts[0].textContent).toBe('Hidden setup context');
      expect(message.parts[0].createdAt).toBeInstanceOf(Date);
      const created = await threads.insertAndReturnOne(WORKSPACE_ID, {
        userWorkspaceId: OWNER_ID,
        title: 'New workspace chat',
      });
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.activeStreamId).toBeNull();
      expect(created.totalInputCredits).toBe(0);
      expect(created.workspaceId).toBe(WORKSPACE_ID);
      const checkpointId = '20202020-8888-4888-8888-888888888888';
      await Promise.all(
        [1, 2].map(() =>
          messages.upsert(
            WORKSPACE_ID,
            {
              id: checkpointId,
              threadId: THREAD_ID,
              turnId: TURN_ID,
              role: 'assistant' as AgentMessageEntity['role'],
            },
            ['id'],
          ),
        ),
      );
      expect(
        await messages.count(WORKSPACE_ID, { where: { id: checkpointId } }),
      ).toBe(1);
      expect(emitDatabaseBatchEvent).not.toHaveBeenCalled();
    });

    it('writes and resolves owner messages while workspace sender fields are still absent', async () => {
      const legacyMessages = await prepareLegacyMessages();
      const chat = createChatService(legacyMessages);
      const actors = createActorService(legacyMessages);
      const thread = await threads.insertAndReturnOne(WORKSPACE_ID, {
        userWorkspaceId: OWNER_ID,
      });
      const kickoff = await chat.ensureHiddenKickoffMessage({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OWNER_ID,
        threadId: thread.id,
        text: 'Setup during deploy',
      });
      const message = await chat.addMessage({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OWNER_ID,
        threadId: thread.id,
        uiMessage: {
          role: AgentMessageRole.USER,
          parts: [{ type: 'text', text: 'Live message during deploy' }],
        },
      });
      const queued = await chat.queueMessage({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OWNER_ID,
        threadId: thread.id,
        text: 'Queued during deploy',
      });
      await chat.promoteQueuedMessage({
        workspaceId: WORKSPACE_ID,
        threadId: thread.id,
        messageId: queued.id,
      });
      for (const messageId of [kickoff.id, message.id, queued.id]) {
        await expect(
          actors.resolveMessage({
            workspaceId: WORKSPACE_ID,
            threadId: thread.id,
            messageId,
          }),
        ).resolves.toMatchObject({
          sender: { userWorkspaceId: OWNER_ID, applicationId: null },
        });
      }
      const saved = await legacyMessages.findOneOrFail(WORKSPACE_ID, {
        where: { id: message.id },
        relations: { parts: true },
      });
      expect(saved.parts[0].textContent).toBe('Live message during deploy');
      expect(
        await legacyMessages.findOneOrFail(WORKSPACE_ID, {
          where: { id: queued.id },
        }),
      ).toMatchObject({ status: AgentMessageStatus.SENT });
    });

    it.each([
      { senderUserWorkspaceId: THREAD_ID, senderApplicationId: null },
      { senderUserWorkspaceId: OWNER_ID, senderApplicationId: TURN_ID },
    ])(
      'refuses to discard unrecoverable attribution on an old workspace: %o',
      async (sender) => {
        const legacyMessages = await prepareLegacyMessages();
        const count = await legacyMessages.count(WORKSPACE_ID);
        await expect(
          legacyMessages.insert(WORKSPACE_ID, [
            {
              threadId: THREAD_ID,
              role: AgentMessageRole.USER,
              senderUserWorkspaceId: OWNER_ID,
              senderApplicationId: null,
            },
            { threadId: THREAD_ID, role: AgentMessageRole.USER, ...sender },
          ]),
        ).rejects.toThrow('Chat sender attribution is being upgraded');
        expect(await legacyMessages.count(WORKSPACE_ID)).toBe(count);
      },
    );

    it('preserves available sender fields during partial expansion and resumes full attribution after upgrade', async () => {
      const legacyMessages = await prepareLegacyMessages([
        'senderApplicationId',
      ]);
      const legacy = await legacyMessages.insertAndReturnOne(WORKSPACE_ID, {
        threadId: THREAD_ID,
        role: AgentMessageRole.USER,
        senderUserWorkspaceId: TURN_ID,
        senderApplicationId: null,
      });
      expect(legacy.senderUserWorkspaceId).toBe(TURN_ID);
      await dataSource.query(
        `ALTER TABLE "${SCHEMA}"."agentMessage" ADD COLUMN "senderApplicationId" uuid`,
      );
      const upgraded = await messages.insertAndReturnOne(WORKSPACE_ID, {
        threadId: THREAD_ID,
        role: AgentMessageRole.USER,
        senderUserWorkspaceId: TURN_ID,
        senderApplicationId: MESSAGE_ID,
      });
      await expect(
        createActorService(messages).resolveMessage({
          workspaceId: WORKSPACE_ID,
          threadId: THREAD_ID,
          messageId: upgraded.id,
        }),
      ).resolves.toMatchObject({
        sender: { userWorkspaceId: TURN_ID, applicationId: MESSAGE_ID },
      });
    });

    it('still rejects unrelated unknown fields on an old workspace', async () => {
      const legacyMessages = await prepareLegacyMessages();
      await expect(
        legacyMessages.insert(WORKSPACE_ID, {
          threadId: THREAD_ID,
          role: AgentMessageRole.USER,
          unexpectedField: null,
        } as never),
      ).rejects.toThrow(
        'Field metadata for field "unexpectedField" is missing',
      );
    });

    it('loads messages chronologically and finds the latest processed message with TypeORM ordering', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const earlierId = '20202020-1111-4111-8111-000000000001';
      const laterId = '20202020-1111-4111-8111-000000000002';

      await messages.insert(WORKSPACE_ID, [
        {
          id: laterId,
          threadId: THREAD_ID,
          role: 'assistant' as AgentMessageEntity['role'],
          processedAt: new Date('2026-09-20T12:00:00Z'),
        },
        {
          id: earlierId,
          threadId: THREAD_ID,
          role: 'user' as AgentMessageEntity['role'],
          processedAt: new Date('2026-09-20T11:00:00Z'),
        },
      ]);

      const chronological = await messages.find(WORKSPACE_ID, {
        where: { threadId: THREAD_ID },
        order: { processedAt: { direction: 'ASC', nulls: 'LAST' } },
        relations: { parts: true },
      });

      expect(chronological.map(({ id }) => id)).toEqual([
        earlierId,
        laterId,
        MESSAGE_ID,
      ]);
      expect(chronological[2].parts[0].textContent).toBe(
        'Hidden setup context',
      );
      expect(
        (
          await messages.findOneOrFail(WORKSPACE_ID, {
            where: { threadId: THREAD_ID },
            order: {
              processedAt: { direction: 'DESC', nulls: 'LAST' },
              createdAt: 'DESC',
              id: 'DESC',
            },
            select: ['id', 'turnId'],
          })
        ).id,
      ).toBe(laterId);
      expect(
        (
          await messages.find(WORKSPACE_ID, {
            where: { threadId: THREAD_ID },
            order: { processedAt: { direction: 'desc', nulls: 'first' } },
          })
        ).map(({ id }) => id),
      ).toEqual([MESSAGE_ID, laterId, earlierId]);
    });

    it('increments exact totals only for the owning stream', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      {
        const table = `"${SCHEMA}"."agentChatThread"`;
        await dataSource.query(
          `UPDATE ${table} SET "activeStreamId" = 'stream', "totalInputCredits" = 9007199254740993`,
        );
        const options = {
          repository: threads,
          workspaceId: WORKSPACE_ID,
          threadId: THREAD_ID,
          usage: {
            totalInputTokens: 1,
            totalOutputTokens: 2,
            totalInputCredits: 1,
            totalOutputCredits: 1,
            totalCacheReadTokens: 0,
            totalCacheCreationTokens: 0,
            contextWindowTokens: 1000,
            conversationSize: 3,
            pendingQuestionMessageId: null,
          },
        };
        expect(
          await updateAgentChatThreadUsage({
            ...options,
            streamId: 'superseded',
          }),
        ).toEqual({ affected: 0 });
        expect(
          await updateAgentChatThreadUsage({ ...options, streamId: 'stream' }),
        ).toEqual({ affected: 1 });
        expect(
          (
            await dataSource.query(`SELECT "totalInputCredits" FROM ${table}`)
          )[0].totalInputCredits,
        ).toBe('9007199254740994');
        await dataSource.query(`UPDATE ${table} SET "activeStreamId" = NULL`);
      }
    });

    it('enforces one live hidden kickoff per thread and releases a trashed slot', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const insert = () =>
        dataSource.query(
          `INSERT INTO "${SCHEMA}"."agentMessage" ("threadId", role, "isHidden") VALUES ($1, 'user', true)`,
          [THREAD_ID],
        );
      await expect(insert()).rejects.toThrow('duplicate key');
      await dataSource.query(
        `UPDATE "${SCHEMA}"."agentMessage" SET "deletedAt" = now() WHERE id = $1`,
        [MESSAGE_ID],
      );
      await expect(insert()).resolves.toBeDefined();
    });

    it('does not create constraints referencing core tables', async () => {
      await lifecycle.initializeWorkspace(WORKSPACE_ID);
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const constraints = await dataSource.query(
        `SELECT c.conname FROM pg_constraint c
         JOIN pg_namespace child ON child.oid = c.connamespace
         JOIN pg_class parent ON parent.oid = c.confrelid
         JOIN pg_namespace parent_namespace ON parent_namespace.oid = parent.relnamespace
         WHERE c.contype = 'f' AND child.nspname = $1 AND parent_namespace.nspname = 'core'`,
        [SCHEMA],
      );
      expect(constraints).toEqual([]);
    });

    it('rejects cross-workspace membership before changing the route', async () => {
      await dataSource.query(
        'UPDATE core."userWorkspace" SET "workspaceId" = $1',
        [THREAD_ID],
      );
      await expect(
        migration.migrate({ workspaceId: WORKSPACE_ID, target: 'workspace' }),
      ).rejects.toThrow('cross-workspace');
      expect(await readRoute()).toBe('core');
    });

    it('keeps the fence when a copied value fails verification, then allows abort', async () => {
      const writeState = storage.writeState.bind(storage);
      const corruptCopy = jest
        .spyOn(storage, 'writeState')
        .mockImplementation(async (runner, workspaceId, state) => {
          await writeState(runner, workspaceId, state);
          if (
            state.migration?.phase === 'copying' &&
            state.migration.tableIndex === 5
          )
            await runner.query(
              `UPDATE "${SCHEMA}"."agentChatThread" SET title = 'corrupted'`,
            );
        });
      await expect(
        migration.migrate({ workspaceId: WORKSPACE_ID, target: 'workspace' }),
      ).rejects.toThrow('verification failed');
      corruptCopy.mockRestore();
      await expect(
        storage.run(WORKSPACE_ID, async () => undefined),
      ).rejects.toThrow('being migrated');
      await migration.abort({ workspaceId: WORKSPACE_ID, dryRun: false });
      expect(await readRoute()).toBe('core');
      expect(
        (
          await dataSource.query(
            `SELECT count(*) FROM "${SCHEMA}"."agentChatThread"`,
          )
        )[0].count,
      ).toBe('0');
    });

    it('cleans only obsolete snapshots after retention and can still reverse-copy for rollback', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await expect(
        migration.cleanup({
          workspaceId: WORKSPACE_ID,
          dryRun: false,
          retentionDays: 14,
        }),
      ).resolves.toBeUndefined();
      expect(
        (
          await dataSource.query('SELECT count(*) FROM core."agentChatThread"')
        )[0].count,
      ).toBe('1');
      await dataSource.query(
        `UPDATE core."keyValuePair" SET value = jsonb_set(value, '{verifiedAt}', to_jsonb($2::text)) WHERE "workspaceId" = $1`,
        [WORKSPACE_ID, new Date(Date.now() - 15 * 86400000).toISOString()],
      );
      await migration.cleanup({
        workspaceId: WORKSPACE_ID,
        dryRun: false,
        retentionDays: 14,
      });
      expect(
        (
          await dataSource.query('SELECT count(*) FROM core."agentChatThread"')
        )[0].count,
      ).toBe('0');
      expect(
        (
          await dataSource.query(
            `SELECT count(*) FROM "${SCHEMA}"."agentChatThread"`,
          )
        )[0].count,
      ).toBe('1');
      await migration.migrate({ workspaceId: WORKSPACE_ID, target: 'core' });
      expect(
        (
          await dataSource.query('SELECT count(*) FROM core."agentChatThread"')
        )[0].count,
      ).toBe('1');
    });

    it('preserves verified and cleaned facts when aborting a rollback', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const state = {
        storage: 'workspace',
        verifiedAt: '2026-01-01T00:00:00.000Z',
        cleanedAt: '2026-02-01T00:00:00.000Z',
      };
      await dataSource.query(
        `UPDATE core."keyValuePair" SET value = $1::jsonb WHERE "workspaceId" = $2`,
        [
          JSON.stringify({
            ...state,
            migration: {
              phase: 'copying',
              target: 'core',
              tableIndex: 0,
              lastId: null,
            },
          }),
          WORKSPACE_ID,
        ],
      );
      await migration.abort({ workspaceId: WORKSPACE_ID, dryRun: false });
      expect(
        (
          await dataSource.query(
            `SELECT value FROM core."keyValuePair" WHERE "workspaceId" = $1`,
            [WORKSPACE_ID],
          )
        )[0].value,
      ).toEqual(state);
    });

    it('skips ineligible cleanup but rejects corrupt durable state', async () => {
      await expect(
        migration.cleanup({
          workspaceId: WORKSPACE_ID,
          dryRun: true,
          retentionDays: 14,
        }),
      ).resolves.toBeUndefined();
      await expect(
        migration.cleanup({
          workspaceId: WORKSPACE_ID,
          dryRun: false,
          retentionDays: 14,
        }),
      ).resolves.toBeUndefined();
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await dataSource.query(
        `UPDATE core."keyValuePair" SET value = jsonb_set(value, '{verifiedAt}', '"invalid"')`,
      );
      await expect(
        migration.cleanup({
          workspaceId: WORKSPACE_ID,
          dryRun: true,
          retentionDays: 14,
        }),
      ).rejects.toThrow('Invalid agent history storage state');
    });

    it('fails closed for missing or mistyped routes after cutover', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await dataSource.query(`UPDATE core."keyValuePair" SET type = 'WRONG'`);
      await expect(
        storage.run(WORKSPACE_ID, async () => undefined),
      ).rejects.toThrow('Invalid agent history storage state');
      await expect(lifecycle.initializeWorkspace(WORKSPACE_ID)).rejects.toThrow(
        'Invalid agent history storage state',
      );
      await dataSource.query('DELETE FROM core."keyValuePair"');
      await expect(
        storage.run(WORKSPACE_ID, async () => undefined),
      ).rejects.toThrow('route is missing');
      await expect(lifecycle.initializeWorkspace(WORKSPACE_ID)).rejects.toThrow(
        'route is missing',
      );
    });

    it('leaves core-stored history out of reports and keeps a report stable across core cleanup', async () => {
      await storage.runReadOnlyReport(
        [WORKSPACE_ID],
        async ({ partitions }) => {
          expect(partitions).toEqual([]);
        },
      );
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await dataSource.query(
        `UPDATE core."keyValuePair" SET value = jsonb_set(value, '{verifiedAt}', '"2020-01-01T00:00:00.000Z"')`,
      );
      await storage.runReadOnlyReport(
        [WORKSPACE_ID],
        async ({ manager, partitions }) => {
          expect(partitions.map(({ workspaceIds }) => workspaceIds)).toEqual([
            [WORKSPACE_ID],
          ]);
          await migration.cleanup({
            workspaceId: WORKSPACE_ID,
            dryRun: false,
            retentionDays: 14,
          });
          expect(
            (
              await manager.query(
                `SELECT count(*) FROM ${partitions[0].table('agentChatThread')}`,
              )
            )[0].count,
          ).toBe('1');
        },
      );
      expect(
        (
          await dataSource.query('SELECT count(*) FROM core."agentChatThread"')
        )[0].count,
      ).toBe('0');
    });

    it('rejects a destination collision introduced after preflight without advancing the cursor', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const writeState = storage.writeState.bind(storage);
      const collision = jest
        .spyOn(storage, 'writeState')
        .mockImplementation(async (runner, workspaceId, state) => {
          await writeState(runner, workspaceId, state);
          if (
            state.migration?.phase === 'copying' &&
            state.migration.tableIndex === 0
          ) {
            await runner.query(
              `INSERT INTO core."agentChatThread" (id, "workspaceId", "userWorkspaceId") VALUES ($1, $2, $3)`,
              [THREAD_ID, MESSAGE_ID, OWNER_ID],
            );
          }
        });
      await expect(
        migration.migrate({
          workspaceId: WORKSPACE_ID,
          target: 'core',
          batchSize: 1,
        }),
      ).rejects.toThrow(`Could not copy agentChatThread ${THREAD_ID}`);
      collision.mockRestore();
      const [{ value }] = await dataSource.query(
        `SELECT value FROM core."keyValuePair" WHERE "workspaceId" = $1`,
        [WORKSPACE_ID],
      );
      expect(value.migration).toMatchObject({ tableIndex: 0, lastId: null });
      await dataSource.query(
        'DELETE FROM core."agentChatThread" WHERE "workspaceId" = $1',
        [MESSAGE_ID],
      );
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'core',
        batchSize: 1,
      });
    });

    it('lists support threads only from workspaces on workspace storage', async () => {
      const otherWorkspaceId = '20202020-9999-4999-8999-999999999999';
      const otherThreadId = '20202020-7777-4777-8777-777777777777';
      await dataSource.query(
        `INSERT INTO core.workspace (id, "allowImpersonation") VALUES ($1, true)`,
        [otherWorkspaceId],
      );
      await dataSource.query(
        `INSERT INTO core."agentChatThread" (id, "workspaceId", "userWorkspaceId", "createdAt") VALUES ($1, $2, $3, '2020-01-01')`,
        [otherThreadId, otherWorkspaceId, OWNER_ID],
      );
      const workspaceIds = [WORKSPACE_ID, otherWorkspaceId];
      await storage.runReadOnlyReport(workspaceIds, async ({ partitions }) =>
        expect(partitions).toHaveLength(0),
      );
      const support = new AdminPanelGlobalChatThreadsService(
        {
          find: async () => workspaceIds.map((id) => ({ id })),
        } as unknown as Repository<WorkspaceEntity>,
        storage,
      );
      const options = {
        scope: AdminChatThreadScope.ALL,
        hasErrorOnly: false,
        userNeverEngagedOnly: false,
        sortBy: AdminChatThreadSortField.CREATED_AT,
        sortDirection: AdminChatThreadSortDirection.ASC,
        limit: 1,
        offset: 0,
      };
      expect(await support.getGlobalChatThreads(options)).toMatchObject({
        totalCount: 0,
        threads: [],
      });
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await storage.runReadOnlyReport(workspaceIds, async ({ partitions }) =>
        expect(partitions).toHaveLength(1),
      );
      expect(await support.getGlobalChatThreads(options)).toMatchObject({
        totalCount: 1,
        hasMore: false,
        threads: [{ id: THREAD_ID }],
      });
    });

    it('keeps support search and thread lookup available while another workspace migrates', async () => {
      const otherWorkspaceId = '20202020-9999-4999-8999-999999999999';
      await dataSource.query(
        `INSERT INTO core.workspace (id, "allowImpersonation") VALUES ($1, true)`,
        [otherWorkspaceId],
      );
      const runner = dataSource.createQueryRunner();
      await storage.writeState(runner, otherWorkspaceId, {
        storage: 'core',
        migration: {
          target: 'workspace',
          phase: 'copying',
          tableIndex: 0,
          lastId: null,
        },
      });
      await runner.release();
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const workspaceRepository = {
        find: async () => [{ id: otherWorkspaceId }, { id: WORKSPACE_ID }],
        findOne: async ({ where }: { where: { id: string } }) =>
          (
            await dataSource.query(
              `SELECT id, "allowImpersonation" FROM core.workspace WHERE id = $1`,
              [where.id],
            )
          )[0],
      } as unknown as Repository<WorkspaceEntity>;
      const support = new AdminPanelGlobalChatThreadsService(
        workspaceRepository,
        storage,
      );
      expect(
        await support.getGlobalChatThreads({
          scope: AdminChatThreadScope.ALL,
          hasErrorOnly: false,
          userNeverEngagedOnly: false,
          sortBy: AdminChatThreadSortField.CREATED_AT,
          sortDirection: AdminChatThreadSortDirection.ASC,
          limit: 10,
          offset: 0,
        }),
      ).toMatchObject({ totalCount: 1, threads: [{ id: THREAD_ID }] });
      const chat = new AdminPanelChatService(
        storage,
        workspaceRepository,
        threads,
        messages,
      );
      expect(await chat.getChatThreadMessages(THREAD_ID)).toMatchObject({
        thread: { id: THREAD_ID },
        messages: [{ id: MESSAGE_ID }],
      });
      const otherRunner = dataSource.createQueryRunner();
      await storage.writeState(otherRunner, otherWorkspaceId, {
        storage: 'core',
      });
      await otherRunner.release();
      expect(await chat.getChatThreadMessages(THREAD_ID)).toMatchObject({
        thread: { id: THREAD_ID },
        messages: [{ id: MESSAGE_ID }],
      });
      await dataSource.query(
        `UPDATE core.workspace SET "allowImpersonation" = false WHERE id = $1`,
        [WORKSPACE_ID],
      );
      await expect(chat.getChatThreadMessages(THREAD_ID)).rejects.toThrow(
        'Thread not found',
      );
    });

    it('returns domain errors for missing history and invalid workspace scope', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await expect(
        threads.findOneOrFail(WORKSPACE_ID, { where: { id: OWNER_ID } }),
      ).rejects.toMatchObject({
        code: 'THREAD_NOT_FOUND',
        userFriendlyMessage: { message: 'Chat thread not found.' },
      });
      await expect(
        storage.run('', async () => undefined),
      ).rejects.toMatchObject({ code: 'INVALID_WORKSPACE' });
      await expect(
        threads.find(WORKSPACE_ID, { where: { workspaceId: WORKSPACE_ID } }),
      ).rejects.toMatchObject({ code: 'INVALID_CRITERIA' });
    });

    it('previews abort without discarding destination rows or changing the route', async () => {
      const runner = dataSource.createQueryRunner();
      const state = {
        storage: 'core',
        migration: {
          target: 'workspace',
          phase: 'copying',
          tableIndex: 2,
          lastId: null,
        },
      } as const;
      await storage.writeState(runner, WORKSPACE_ID, state);
      const log = jest.spyOn(Logger.prototype, 'log');
      try {
        await migration.abort({ workspaceId: WORKSPACE_ID, dryRun: true });
        expect(log).toHaveBeenCalledWith(
          expect.stringContaining('would discard workspace destination'),
        );
        expect(log).toHaveBeenCalledWith(
          expect.stringContaining('"tableIndex":2'),
        );
        expect(await storage.readState(runner, WORKSPACE_ID)).toEqual(state);
        expect(
          await dataSource.query('SELECT id FROM core."agentChatThread"'),
        ).toHaveLength(1);
      } finally {
        log.mockRestore();
        await runner.release();
      }
    });

    it('requires routing deployment confirmation before deleting a core snapshot', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const runner = dataSource.createQueryRunner();
      await storage.writeState(runner, WORKSPACE_ID, {
        storage: 'workspace',
        verifiedAt: '2020-01-01T00:00:00.000Z',
      });
      await runner.release();
      const command = new AgentHistoryCleanupCommand(
        {} as WorkspaceIteratorService,
        migration,
      );
      await expect(
        command.runOnWorkspace({
          workspaceId: WORKSPACE_ID,
          index: 0,
          total: 1,
          options: {},
        }),
      ).rejects.toThrow('--routing-deployed');
      expect(
        await dataSource.query('SELECT id FROM core."agentChatThread"'),
      ).toHaveLength(1);
      await command.runOnWorkspace({
        workspaceId: WORKSPACE_ID,
        index: 0,
        total: 1,
        options: { dryRun: true },
      });
      expect(
        await dataSource.query('SELECT id FROM core."agentChatThread"'),
      ).toHaveLength(1);
      const options = { dryRun: false, routingDeployed: true };
      await command.runOnWorkspace({
        workspaceId: WORKSPACE_ID,
        index: 0,
        total: 1,
        options,
      });
      expect(
        await dataSource.query('SELECT id FROM core."agentChatThread"'),
      ).toHaveLength(0);
    });

    it('rejects unsupported message enums before clearing the rollback destination', async () => {
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      await dataSource.query(
        `UPDATE "${SCHEMA}"."agentMessage" SET role = 'invalid' WHERE id = $1`,
        [MESSAGE_ID],
      );
      await expect(
        migration.migrate({ workspaceId: WORKSPACE_ID, target: 'core' }),
      ).rejects.toThrow('role or status unsupported');
      expect(
        await dataSource.query('SELECT id FROM core."agentChatThread"'),
      ).toHaveLength(1);
      expect(await readRoute()).toBe('workspace');
    });

    it('waits for an active runner before initialization and preserves its migration state', async () => {
      const initializationDataSource = new DataSource({
        type: 'postgres',
        url: DATABASE_URL,
        extra: { options: '-c lock_timeout=100ms' },
      });
      await initializationDataSource.initialize();
      const initializer = new AgentHistoryLifecycleService(
        initializationDataSource,
        storage,
      );
      const runner = dataSource.createQueryRunner();
      const key = `${AGENT_HISTORY_STORAGE_KEY}:runner:${WORKSPACE_ID}`;
      await runner.connect();
      try {
        await runner.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [
          key,
        ]);
        await expect(
          initializer.initializeWorkspace(WORKSPACE_ID),
        ).rejects.toThrow('lock timeout');
        expect(
          await runner.query(
            'SELECT value FROM core."keyValuePair" WHERE "workspaceId" = $1',
            [WORKSPACE_ID],
          ),
        ).toEqual([]);
        const state = {
          storage: 'core' as const,
          migration: {
            phase: 'aborting' as const,
            target: 'workspace' as const,
            tableIndex: 0,
            lastId: null,
          },
        };
        await storage.writeState(runner, WORKSPACE_ID, state);
        await runner.query(
          'SELECT pg_advisory_unlock(hashtextextended($1, 0))',
          [key],
        );
        await initializer.initializeWorkspace(WORKSPACE_ID);
        expect(await storage.readState(runner, WORKSPACE_ID)).toEqual(state);
      } finally {
        await runner.query('SELECT pg_advisory_unlock_all()');
        await runner.release();
        await initializationDataSource.destroy();
      }
    });

    it('defaults new empty workspaces to workspace storage without moving legacy history', async () => {
      await lifecycle.initializeWorkspace(WORKSPACE_ID);
      expect(await readRoute()).toBe('core');
      await dataSource.query(
        'DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1',
        [WORKSPACE_ID],
      );
      for (const table of [...AGENT_HISTORY_TABLES].reverse())
        await dataSource.query(`DELETE FROM core."${table.name}"`);
      await lifecycle.initializeWorkspace(WORKSPACE_ID);
      expect(await readRoute()).toBe('workspace');
      await lifecycle.initializeWorkspace(WORKSPACE_ID);
      expect(await readRoute()).toBe('workspace');
    });

    it('ignores a legacy core default when provisioning a new empty workspace', async () => {
      for (const table of [...AGENT_HISTORY_TABLES].reverse())
        await dataSource.query(`DELETE FROM core."${table.name}"`);
      await dataSource.query(
        `INSERT INTO core."keyValuePair" ("key", "type", "value") VALUES ('agent-history-new-workspace-storage-v1', 'CONFIG_VARIABLE', '{"storage":"core"}'::jsonb)`,
      );
      await lifecycle.initializeWorkspace(WORKSPACE_ID);
      expect(await readRoute()).toBe('workspace');
    });
    it('does not allow copy to resume after an interrupted abort', async () => {
      const writeState = storage.writeState.bind(storage);
      const failCopy = jest
        .spyOn(storage, 'writeState')
        .mockImplementation(async (runner, workspaceId, state) => {
          if (
            state.migration?.phase === 'copying' &&
            state.migration.tableIndex === 1
          )
            throw new Error('crash');
          await writeState(runner, workspaceId, state);
        });
      await expect(
        migration.migrate({ workspaceId: WORKSPACE_ID, target: 'workspace' }),
      ).rejects.toThrow('crash');
      failCopy.mockRestore();
      const failAbort = jest
        .spyOn(storage, 'writeState')
        .mockImplementation(async (runner, workspaceId, state) => {
          if (!state.migration) throw new Error('abort interrupted');
          await writeState(runner, workspaceId, state);
        });
      await expect(
        migration.abort({ workspaceId: WORKSPACE_ID, dryRun: false }),
      ).rejects.toThrow('abort interrupted');
      failAbort.mockRestore();
      await expect(
        migration.migrate({ workspaceId: WORKSPACE_ID, target: 'workspace' }),
      ).rejects.toThrow('Finish aborting');
      await migration.abort({ workspaceId: WORKSPACE_ID, dryRun: false });
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
    });

    it('keeps support search counts and revocation checks after the move', async () => {
      const support = new AdminPanelGlobalChatThreadsService(
        {
          find: jest.fn().mockResolvedValue([{ id: WORKSPACE_ID }]),
        } as unknown as Repository<WorkspaceEntity>,
        storage,
      );
      const options = {
        scope: AdminChatThreadScope.ONBOARDING,
        hasErrorOnly: false,
        userNeverEngagedOnly: false,
        sortBy: AdminChatThreadSortField.UPDATED_AT,
        sortDirection: AdminChatThreadSortDirection.DESC,
        limit: 10,
        offset: 0,
      };
      await dataSource.query(
        `INSERT INTO core."agentMessage" ("workspaceId", "threadId", "turnId", role) VALUES ($1, $2, $3, 'user')`,
        [WORKSPACE_ID, THREAD_ID, TURN_ID],
      );
      await migration.migrate({
        workspaceId: WORKSPACE_ID,
        target: 'workspace',
      });
      const after = await support.getGlobalChatThreads(options);
      expect(after.totalCount).toBe(1);
      expect(after.threads[0].messageCount).toBe(1);
      await dataSource.query(
        'UPDATE core.workspace SET "allowImpersonation" = false',
      );
      expect((await support.getGlobalChatThreads(options)).threads).toEqual([]);
    });
  },
);
