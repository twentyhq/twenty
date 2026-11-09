import { DataSource } from 'typeorm';

import { isEmptyUnprovisionedAgentHistoryWorkspace } from 'src/database/commands/upgrade-version-command/2-43/utils/is-empty-unprovisioned-agent-history-workspace.util';
import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';

describe('isEmptyUnprovisionedAgentHistoryWorkspace', () => {
  const workspaceId = '20202020-1111-4111-8111-111111111111';
  const hasSchema = jest.fn();
  const query = jest.fn();
  const dataSource = new DataSource({ type: 'postgres' });
  const runner = dataSource.createQueryRunner();

  runner.hasSchema = hasSchema;
  runner.connect = jest.fn();
  runner.release = jest.fn();
  runner.query = query;
  dataSource.createQueryRunner = () => runner;

  const agentHistoryStorageService = new AgentHistoryUpgradeStorageService(
    dataSource,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    query.mockReset();
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
    hasSchema.mockResolvedValue(scenario.hasSchema);
    query
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
