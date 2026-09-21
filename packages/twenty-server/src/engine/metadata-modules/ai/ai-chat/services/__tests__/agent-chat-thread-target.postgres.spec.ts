import { isDefined } from 'twenty-shared/utils';
import { WorkspaceSchemaTableManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-table-manager.service';
import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { computeFlatIndexFieldColumnNames } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/index/utils/index-action-handler.utils';
import {
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { AGENT_HISTORY_STORAGE_KEY } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-storage-key.constant';
import { assertNoAgentChatThreadTargets } from 'src/database/commands/agent-history/utils/assert-no-agent-chat-thread-targets.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

jest.mock(
  'src/engine/workspace-cache/services/workspace-cache.service',
  () => ({ WorkspaceCacheService: class {} }),
);
jest.mock('src/engine/twenty-orm/workspace-orm.manager', () => ({
  WorkspaceOrmManager: class {},
}));

const DATABASE_URL = process.env.AGENT_THREAD_TARGET_TEST_DATABASE_URL;

(DATABASE_URL ? describe : describe.skip)(
  'Agent chat thread record links on PostgreSQL',
  () => {
    const workspaceId = v4();
    const userWorkspaceId = v4();
    const otherUserWorkspaceId = v4();
    const threadId = v4();
    const recordId = v4();
    const schema = getWorkspaceSchemaName(workspaceId);
    const dataSource = new DataSource({
      type: 'postgres',
      url: DATABASE_URL,
      entities: [],
    });
    const authContext = {
      type: 'user',
      workspace: { id: workspaceId },
      userWorkspaceId,
    } as UserWorkspaceAuthContext;
    const { allFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: '2026-09-21T00:00:00.000Z',
        workspaceId,
        twentyStandardApplicationId: v4(),
      });
    const company =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.company.universalIdentifier
      ]!;
    const target = { objectMetadataId: company.id, recordId, threadId };
    let canReadRecord = true;
    const getRepository = jest.fn(() => ({
      findOne: async () => (canReadRecord ? { id: recordId } : null),
    }));
    const service = new AgentChatThreadTargetService(
      {
        getOrRecompute: async () => allFlatEntityMaps,
      } as unknown as WorkspaceCacheService,
      {
        executeInWorkspaceContext: async (work: () => Promise<unknown>) =>
          work(),
        getRepository,
      } as unknown as WorkspaceOrmManager,
      new AgentHistoryStorageService(dataSource),
    );
    const run = <TResult>(
      work: () => Promise<TResult>,
      owner = userWorkspaceId,
    ) =>
      withWorkspaceAuthContext(
        { ...authContext, userWorkspaceId: owner },
        work,
      );
    const list = () =>
      service.findForRecord({ ...target, limit: 50, offset: 0 });
    const countLinks = async () => {
      const [{ count }] = await dataSource.query(
        `SELECT count(*)::int FROM "${schema}"."agentChatThreadTarget" WHERE "deletedAt" IS NULL`,
      );
      return count;
    };

    beforeAll(async () => {
      jest.useRealTimers();
      await dataSource.initialize();
      await dataSource.query(`CREATE SCHEMA IF NOT EXISTS core`);
      await dataSource.query(`CREATE TABLE IF NOT EXISTS core."keyValuePair" (
      "key" text, "workspaceId" uuid, type text, value jsonb, "userId" uuid, "applicationId" uuid
    )`);
      await dataSource.query(`CREATE SCHEMA "${schema}"`);
      await dataSource.query(
        `CREATE TABLE "${schema}".company (id uuid PRIMARY KEY)`,
      );
      await dataSource.query(`CREATE TABLE "${schema}"."agentChatThread" (
      id uuid PRIMARY KEY, "userWorkspaceId" uuid NOT NULL, title text, "createdAt" timestamptz DEFAULT now(), "updatedAt" timestamptz DEFAULT now(), "deletedAt" timestamptz, "archivedAt" timestamptz
    )`);
      await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      const targetObject =
        allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier
        ]!;
      const targetFields = Object.values(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((field) => field.objectMetadataId === targetObject.id);
      const runner = dataSource.createQueryRunner();
      try {
        await new WorkspaceSchemaTableManagerService().createTable({
          queryRunner: runner,
          schemaName: schema,
          tableName: 'agentChatThreadTarget',
          columnDefinitions: targetFields.flatMap((field) =>
            generateColumnDefinitions({
              flatFieldMetadata: field,
              flatObjectMetadata: targetObject,
              workspaceId,
            }),
          ),
        });
        await runner.query(`ALTER TABLE "${schema}"."agentChatThreadTarget"
        ADD FOREIGN KEY ("threadId") REFERENCES "${schema}"."agentChatThread"(id) ON DELETE CASCADE,
        ADD FOREIGN KEY ("targetCompanyId") REFERENCES "${schema}".company(id) ON DELETE CASCADE`);
      } finally {
        await runner.release();
      }
      // Custom targets only have a lookup index; the API must still serialize concurrent attachments.
      await dataSource.query(
        `INSERT INTO core."keyValuePair" ("key", "workspaceId", type, value) VALUES ($1, $2, 'CONFIG_VARIABLE', '{"storage":"workspace"}')`,
        [AGENT_HISTORY_STORAGE_KEY, workspaceId],
      );
    });

    beforeEach(async () => {
      canReadRecord = true;
      getRepository.mockClear();
      await dataSource.query(`DELETE FROM "${schema}"."agentChatThread"`);
      await dataSource.query(`DELETE FROM "${schema}".company`);
      await dataSource.query(
        `INSERT INTO "${schema}".company (id) VALUES ($1)`,
        [recordId],
      );
      await dataSource.query(
        `INSERT INTO "${schema}"."agentChatThread" (id, "userWorkspaceId", title) VALUES ($1, $2, 'Private conversation')`,
        [threadId, userWorkspaceId],
      );
      await dataSource.query(
        `UPDATE core."keyValuePair" SET value = '{"storage":"workspace"}' WHERE "key" = $1 AND "workspaceId" = $2`,
        [AGENT_HISTORY_STORAGE_KEY, workspaceId],
      );
    });

    afterAll(async () => {
      if (dataSource.isInitialized) {
        await dataSource.query(`DROP SCHEMA "${schema}" CASCADE`);
        await dataSource.query(
          `DELETE FROM core."keyValuePair" WHERE "key" = $1 AND "workspaceId" = $2`,
          [AGENT_HISTORY_STORAGE_KEY, workspaceId],
        );
        await dataSource.destroy();
      }
    });

    it('attaches concurrently only once, detaches idempotently, and reattaches', async () => {
      await Promise.all(
        Array.from({ length: 8 }, () => run(() => service.attach(target))),
      );
      expect(await countLinks()).toBe(1);
      expect(await run(list)).toEqual([
        expect.objectContaining({
          id: threadId,
          workspaceId,
          title: 'Private conversation',
        }),
      ]);
      await run(() => service.detach(target));
      await run(() => service.detach(target));
      expect(await run(list)).toEqual([]);
      await run(() => service.attach(target));
      expect(await countLinks()).toBe(1);
    });

    it('builds all standard indexes and enforces one live link per thread and record', async () => {
      const runner = dataSource.createQueryRunner();
      try {
        for (const index of Object.values(
          allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
        )
          .filter(isDefined)
          .filter(
            (index) =>
              index.objectMetadataUniversalIdentifier ===
              STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
          )) {
          await new WorkspaceSchemaIndexManagerService().createIndex({
            queryRunner: runner,
            schemaName: schema,
            tableName: 'agentChatThreadTarget',
            index: {
              name: index.name,
              isUnique: index.isUnique,
              where: index.indexWhereClause ?? undefined,
              columns: computeFlatIndexFieldColumnNames({
                flatIndexFieldMetadatas: index.flatIndexFieldMetadatas,
                flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
              }),
            },
          });
        }
        await run(() => service.attach(target));
        await expect(
          runner.query(
            `INSERT INTO "${schema}"."agentChatThreadTarget" ("threadId", "targetCompanyId") VALUES ($1, $2)`,
            [threadId, recordId],
          ),
        ).rejects.toMatchObject({ code: '23505' });
        await run(() => service.detach(target));
        await run(() => service.attach(target));
        expect(await countLinks()).toBe(1);
      } finally {
        await runner.release();
      }
    });

    it('keeps record links private to the thread owner', async () => {
      await run(() => service.attach(target));
      expect(await run(list, otherUserWorkspaceId)).toEqual([]);
      await expect(
        run(() => service.attach(target), otherUserWorkspaceId),
      ).rejects.toThrow('Thread not found');
      await expect(
        run(() => service.detach(target), otherUserWorkspaceId),
      ).rejects.toThrow('Thread not found');
      expect(await countLinks()).toBe(1);
    });

    it('requires current record-read permission for reads and writes', async () => {
      canReadRecord = false;
      await expect(run(() => service.attach(target))).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(run(() => service.detach(target))).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(run(list)).rejects.toBeInstanceOf(NotFoundException);
      expect(getRepository).toHaveBeenCalledWith('company');
      expect(await countLinks()).toBe(0);
    });

    it('rejects foreign-workspace or unsupported object identifiers', async () => {
      await expect(
        run(() => service.attach({ ...target, objectMetadataId: v4() })),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(getRepository).not.toHaveBeenCalled();
      expect(await countLinks()).toBe(0);
    });

    it('does not allow non-user contexts to access private threads', async () => {
      await expect(
        withWorkspaceAuthContext(
          { type: 'system', workspace: authContext.workspace },
          () => service.attach(target),
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(await countLinks()).toBe(0);
    });

    it.each([
      { storage: 'core' },
      {
        storage: 'workspace',
        migration: {
          phase: 'copying',
          target: 'core',
          tableIndex: 0,
          lastId: null,
        },
      },
    ])('fails closed while history is unavailable: %j', async (state) => {
      await dataSource.query(
        `UPDATE core."keyValuePair" SET value = $3 WHERE "key" = $1 AND "workspaceId" = $2`,
        [AGENT_HISTORY_STORAGE_KEY, workspaceId, state],
      );
      await expect(run(() => service.attach(target))).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      expect(await countLinks()).toBe(0);
    });

    it('hides archived threads and retains their links for restoration', async () => {
      await run(() => service.attach(target));
      await dataSource.query(
        `UPDATE "${schema}"."agentChatThread" SET "archivedAt" = now() WHERE id = $1`,
        [threadId],
      );
      expect(await run(list)).toEqual([]);
      expect(await countLinks()).toBe(1);
      await dataSource.query(
        `UPDATE "${schema}"."agentChatThread" SET "archivedAt" = NULL WHERE id = $1`,
        [threadId],
      );
      expect(await run(list)).toHaveLength(1);
    });

    it.each(['company', 'agentChatThread'])(
      'cascades permanent %s deletion',
      async (tableName) => {
        await run(() => service.attach(target));
        await dataSource.query(`DELETE FROM "${schema}"."${tableName}"`);
        expect(await countLinks()).toBe(0);
      },
    );

    it('blocks core rollback until live links are detached', async () => {
      await run(() => service.attach(target));
      const runner = dataSource.createQueryRunner();
      try {
        await expect(
          assertNoAgentChatThreadTargets(runner, workspaceId),
        ).rejects.toThrow('Detach record links');
        await run(() => service.detach(target));
        await expect(
          assertNoAgentChatThreadTargets(runner, workspaceId),
        ).resolves.toBeUndefined();
      } finally {
        await runner.release();
      }
    });

    it('validates pagination and supports an empty later page', async () => {
      await run(() => service.attach(target));
      await expect(
        run(() => service.findForRecord({ ...target, limit: 101, offset: 0 })),
      ).rejects.toThrow('Invalid pagination');
      expect(
        await run(() =>
          service.findForRecord({ ...target, limit: 1, offset: 1 }),
        ),
      ).toEqual([]);
    });
  },
);
