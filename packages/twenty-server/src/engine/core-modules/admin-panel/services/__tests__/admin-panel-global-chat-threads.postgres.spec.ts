import { DataSource, type Repository } from 'typeorm';

import { AdminChatThreadScope } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-scope.enum';
import { AdminChatThreadSortDirection } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-direction.enum';
import { AdminChatThreadSortField } from 'src/engine/core-modules/admin-panel/enums/admin-chat-thread-sort-field.enum';
import { AdminPanelGlobalChatThreadsService } from 'src/engine/core-modules/admin-panel/services/admin-panel-global-chat-threads.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentHistoryWorkspaceStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

jest.mock('src/engine/core-modules/workspace/workspace.entity', () => ({
  WorkspaceEntity: class WorkspaceEntity {},
}));

const DATABASE_URL = process.env.ADMIN_CHAT_REPORT_TEST_DATABASE_URL;
const WORKSPACE_IDS = Array.from(
  { length: 26 },
  (_, index) =>
    `20202020-1111-4111-8111-${String(index + 1).padStart(12, '0')}`,
);
const OPTIONS = {
  scope: AdminChatThreadScope.ALL,
  hasErrorOnly: false,
  userNeverEngagedOnly: false,
  sortBy: AdminChatThreadSortField.CREATED_AT,
  sortDirection: AdminChatThreadSortDirection.ASC,
  limit: 1,
  offset: 1,
};

(DATABASE_URL ? describe : describe.skip)(
  'admin chat report on PostgreSQL',
  () => {
    const dataSource = new DataSource({
      type: 'postgres',
      url: DATABASE_URL,
      entities: [],
      synchronize: false,
    });
    const storage = new AgentHistoryWorkspaceStorageService(dataSource);
    const service = new AdminPanelGlobalChatThreadsService(
      {
        find: async () => WORKSPACE_IDS.map((id) => ({ id })),
      } as unknown as Repository<WorkspaceEntity>,
      storage,
    );

    beforeAll(async () => {
      jest.useRealTimers();
      if (new URL(DATABASE_URL!).pathname !== '/admin_chat_report_test') {
        throw new Error('Use the isolated admin_chat_report_test database');
      }
      await dataSource.initialize();
      await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    });

    beforeEach(async () => {
      await dataSource.query(`CREATE SCHEMA core;
      CREATE TABLE core.workspace (id uuid PRIMARY KEY, "displayName" text, "allowImpersonation" boolean, "deletedAt" timestamptz);
      CREATE TABLE core."userWorkspace" (id uuid, "userId" uuid, "workspaceId" uuid, "deletedAt" timestamptz);
      CREATE TABLE core."user" (id uuid, email text, "firstName" text, "lastName" text)`);
      for (const [index, workspaceId] of WORKSPACE_IDS.entries()) {
        const schema = getWorkspaceSchemaName(workspaceId);
        await dataSource.query(`CREATE SCHEMA "${schema}";
        CREATE TABLE "${schema}"."agentChatThread" (id uuid, title text, "workspaceMemberId" uuid, "deletedAt" timestamptz, "createdAt" timestamptz, "updatedAt" timestamptz);
        CREATE TABLE "${schema}"."agentMessage" (id uuid, "threadId" uuid, role text, "isHidden" boolean);
        CREATE TABLE "${schema}"."agentMessagePart" ("messageId" uuid, "toolName" text, "toolOutput" jsonb);
        CREATE TABLE "${schema}"."workspaceMember" (id uuid, "userId" uuid)`);
        await dataSource.query(
          'INSERT INTO core.workspace VALUES ($1, $2, true, null)',
          [workspaceId, `Workspace ${index}`],
        );
        if (index === 0 || index === 25) {
          await dataSource.query(
            `INSERT INTO "${schema}"."agentChatThread" (id, title, "createdAt", "updatedAt") VALUES ($1, $2, $3, $3)`,
            [
              workspaceId,
              `Chat ${index}`,
              new Date(Date.UTC(2026, 0, index + 1)),
            ],
          );
        }
      }
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      if (!dataSource.isInitialized) return;
      for (const workspaceId of WORKSPACE_IDS) {
        await dataSource.query(
          `DROP SCHEMA IF EXISTS "${getWorkspaceSchemaName(workspaceId)}" CASCADE`,
        );
      }
      await dataSource.query('DROP SCHEMA IF EXISTS core CASCADE');
    });

    afterAll(async () => {
      if (dataSource.isInitialized) await dataSource.destroy();
    });

    it('releases earlier workspace locks while later report queries run and preserves global pagination', async () => {
      const createQueryRunner = dataSource.createQueryRunner.bind(dataSource);
      const migrationRunner = createQueryRunner();
      await migrationRunner.connect();
      await migrationRunner.query("SET lock_timeout = '100ms'");
      let migrationCompleted = false;
      jest.spyOn(dataSource, 'createQueryRunner').mockImplementation((mode) => {
        const runner = createQueryRunner(mode);
        const query = runner.query.bind(runner);
        jest
          .spyOn(runner, 'query')
          .mockImplementation(async (...parameters) => {
            const [sql, values] = parameters;
            if (
              typeof sql === 'string' &&
              sql.includes('WITH candidates') &&
              Array.isArray(values) &&
              Array.isArray(values[0]) &&
              values[0][0] === WORKSPACE_IDS[25]
            ) {
              await migrationRunner.query(
                `ALTER TABLE "${getWorkspaceSchemaName(WORKSPACE_IDS[0])}"."agentChatThread" ADD COLUMN "reportLockRegression" text`,
              );
              migrationCompleted = true;
            }
            return query(...parameters);
          });
        return runner;
      });
      try {
        await expect(
          service.getGlobalChatThreads(OPTIONS),
        ).resolves.toMatchObject({
          threads: [{ id: WORKSPACE_IDS[25] }],
          totalCount: 2,
          hasMore: false,
        });
        expect(migrationCompleted).toBe(true);
      } finally {
        await migrationRunner.release();
      }
    });

    it('continues past a batch with no provisioned history tables', async () => {
      for (const workspaceId of WORKSPACE_IDS.slice(0, 25)) {
        await dataSource.query(
          `DROP SCHEMA "${getWorkspaceSchemaName(workspaceId)}" CASCADE`,
        );
      }
      await expect(
        service.getGlobalChatThreads({ ...OPTIONS, offset: 0 }),
      ).resolves.toMatchObject({
        threads: [{ id: WORKSPACE_IDS[25] }],
        totalCount: 1,
        hasMore: false,
      });
    });
  },
);
