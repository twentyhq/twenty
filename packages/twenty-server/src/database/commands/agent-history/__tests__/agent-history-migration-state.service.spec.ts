import { type QueryRunner } from 'typeorm';

import { AgentHistoryMigrationStateService } from 'src/database/commands/agent-history/agent-history-migration-state.service';
import { type AgentHistoryMigrationState } from 'src/database/commands/agent-history/agent-history-migration-state.type';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TABLE_NAME =
  '"workspace_20202020111141118111111111111111"."agentChatThread"';

describe('AgentHistoryMigrationStateService', () => {
  const service = new AgentHistoryMigrationStateService();
  const query = jest.fn();
  const runner = { query } as unknown as QueryRunner;

  beforeEach(() => {
    query.mockReset();
  });

  it.each(['clearing', 'copying', 'aborting'] as const)(
    'retains the %s cursor and rollback retention facts',
    async (phase) => {
      const state: AgentHistoryMigrationState = {
        storage: 'workspace',
        migration: {
          phase,
          target: 'core',
          tableIndex: 5,
          lastId: WORKSPACE_ID,
        },
        verifiedAt: '2026-09-01T00:00:00.000Z',
        cleanedAt: '2026-09-20T00:00:00.000Z',
      };
      query.mockResolvedValue([
        { workspaceId: WORKSPACE_ID, type: 'CONFIG_VARIABLE', value: state },
      ]);

      await expect(service.readState(runner, WORKSPACE_ID)).resolves.toEqual(
        state,
      );
    },
  );

  it.each([
    { storage: 'unknown' },
    { storage: 'workspace', verifiedAt: 'invalid' },
    { storage: 'workspace', cleanedAt: 'invalid' },
    {
      storage: 'core',
      migration: {
        phase: 'copying',
        target: 'core',
        tableIndex: 0,
        lastId: null,
      },
    },
    {
      storage: 'core',
      migration: {
        phase: 'copying',
        target: 'workspace',
        tableIndex: 6,
        lastId: null,
      },
    },
    {
      storage: 'core',
      migration: {
        phase: 'copying',
        target: 'workspace',
        tableIndex: 1,
        lastId: 'invalid',
      },
    },
  ])('refuses corrupt durable state: %j', async (value) => {
    query.mockResolvedValue([
      { workspaceId: WORKSPACE_ID, type: 'CONFIG_VARIABLE', value },
    ]);

    await expect(service.readState(runner, WORKSPACE_ID)).rejects.toMatchObject(
      {
        code: 'INVALID_STATE',
      },
    );
  });

  it('refuses a route stored under another key type', async () => {
    query.mockResolvedValue([
      {
        workspaceId: WORKSPACE_ID,
        type: 'USER_VAR',
        value: { storage: 'workspace' },
      },
    ]);

    await expect(service.readState(runner, WORKSPACE_ID)).rejects.toMatchObject(
      {
        code: 'INVALID_STATE',
      },
    );
  });

  it('starts unrouted history in core when the workspace table does not exist', async () => {
    query.mockResolvedValue([]);

    await expect(service.readState(runner, WORKSPACE_ID)).resolves.toEqual({
      storage: 'core',
    });
  });

  it('starts unrouted history in core when the workspace table is empty', async () => {
    query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { workspaceId: WORKSPACE_ID, tableName: TABLE_NAME },
      ])
      .mockResolvedValueOnce([]);

    await expect(service.readState(runner, WORKSPACE_ID)).resolves.toEqual({
      storage: 'core',
    });
  });

  it('refuses to select a stale core snapshot when a populated workspace lost its route', async () => {
    query
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { workspaceId: WORKSPACE_ID, tableName: TABLE_NAME },
      ])
      .mockResolvedValueOnce([{ workspaceId: WORKSPACE_ID }]);

    await expect(service.readState(runner, WORKSPACE_ID)).rejects.toMatchObject(
      {
        code: 'MISSING_STATE',
      },
    );
  });

  it('writes the durable protocol understood by deployed servers', async () => {
    const state: AgentHistoryMigrationState = {
      storage: 'core',
      migration: {
        phase: 'copying',
        target: 'workspace',
        tableIndex: 2,
        lastId: WORKSPACE_ID,
      },
    };
    query.mockResolvedValue([{ key: 'agent-history-storage-v1' }]);

    await service.writeState(runner, WORKSPACE_ID, state);

    expect(query).toHaveBeenCalledWith(expect.any(String), [
      'agent-history-storage-v1',
      WORKSPACE_ID,
      JSON.stringify(state),
    ]);
  });

  it('refuses to overwrite a conflicting non-configuration key', async () => {
    query.mockResolvedValue([]);

    await expect(
      service.writeState(runner, WORKSPACE_ID, { storage: 'workspace' }),
    ).rejects.toMatchObject({ code: 'INVALID_STATE' });
  });
});
