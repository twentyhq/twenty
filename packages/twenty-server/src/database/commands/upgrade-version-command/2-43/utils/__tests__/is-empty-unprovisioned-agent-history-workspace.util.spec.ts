import { type DataSource } from 'typeorm';

import { isEmptyUnprovisionedAgentHistoryWorkspace } from 'src/database/commands/upgrade-version-command/2-43/utils/is-empty-unprovisioned-agent-history-workspace.util';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';

describe('isEmptyUnprovisionedAgentHistoryWorkspace', () => {
  const workspaceId = '20202020-1111-4111-8111-111111111111';
  const runner = {
    hasSchema: jest.fn(),
    connect: jest.fn(),
    release: jest.fn(),
    query: jest.fn(),
  };
  const dataSource = {
    createQueryRunner: () => runner,
  } as unknown as DataSource;
  const agentHistoryStorageService = new AgentHistoryStorageService(dataSource);

  beforeEach(() => {
    jest.clearAllMocks();
    runner.query.mockReset();
  });

  it.each([
    {
      hasSchema: false,
      storage: 'core',
      migration: undefined,
      history: [],
      empty: true,
    },
    {
      hasSchema: true,
      storage: 'core',
      migration: undefined,
      history: [],
      empty: false,
    },
    {
      hasSchema: false,
      storage: 'workspace',
      migration: undefined,
      history: [],
      empty: false,
    },
    {
      hasSchema: false,
      storage: 'core',
      migration: {
        phase: 'copying',
        target: 'workspace',
        tableIndex: 0,
        lastId: null,
      },
      history: [],
      empty: false,
    },
    {
      hasSchema: false,
      storage: 'core',
      migration: undefined,
      history: [{ exists: 1 }],
      empty: false,
    },
  ])('recognizes only empty unprovisioned workspaces: %j', async (scenario) => {
    runner.hasSchema.mockResolvedValue(scenario.hasSchema);
    runner.query
      .mockResolvedValueOnce([
        {
          workspaceId,
          type: 'CONFIG_VARIABLE',
          value: { storage: scenario.storage, migration: scenario.migration },
        },
      ])
      .mockResolvedValueOnce(scenario.history);
    await expect(
      isEmptyUnprovisionedAgentHistoryWorkspace({
        dataSource,
        agentHistoryStorageService,
        workspaceId,
      }),
    ).resolves.toBe(scenario.empty);
    expect(runner.release).toHaveBeenCalledTimes(1);
  });
});
