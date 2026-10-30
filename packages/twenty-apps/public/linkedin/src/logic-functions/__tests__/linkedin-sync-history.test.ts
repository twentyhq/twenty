import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  listMessageChannels: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
  listMessageChannels: mocks.listMessageChannels,
  enqueueJobs: mocks.enqueueJobs,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
}));

const { linkedinSyncHistoryHandler } =
  await import('src/logic-functions/linkedin-sync-history');

const HISTORY_KEY = 'linkedin-history-import:connection-id';

const syncHistory = () =>
  linkedinSyncHistoryHandler({} as never, {
    userWorkspaceId: 'member-user-workspace-id',
  });

const setHistoryImport = (status: 'IMPORTING' | 'COMPLETED' | 'FAILED') =>
  mocks.kvStore.set(HISTORY_KEY, {
    runId: 'run-1',
    importPolicy: 'ALL',
    status,
    importedConversationCount: 12,
    processedConversationCount: 20,
    startedAt: '2026-10-01T00:00:00.000Z',
  });

describe('linkedinSyncHistoryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.listConnections.mockResolvedValue([
      {
        id: 'connection-id',
        name: 'Ada Lovelace',
        handle: 'https://www.linkedin.com/in/ada',
        userWorkspaceId: 'member-user-workspace-id',
        authFailedAt: null,
      },
    ]);
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', visibility: 'METADATA' },
    ]);
  });

  it.each(['COMPLETED', 'FAILED'] as const)(
    'starts a new run after a %s one',
    async (status) => {
      setHistoryImport(status);

      const view = await syncHistory();

      expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
      expect(view).toEqual(
        expect.objectContaining({
          historyImport: expect.objectContaining({
            status: 'IMPORTING',
            processedConversationCount: 0,
          }),
        }),
      );
      expect(
        (mocks.kvStore.get(HISTORY_KEY) as { runId: string }).runId,
      ).not.toBe('run-1');
    },
  );

  it('starts the first run of a connection that never synced', async () => {
    await syncHistory();

    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
  });

  it('leaves a running import alone', async () => {
    setHistoryImport('IMPORTING');

    await syncHistory();

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect((mocks.kvStore.get(HISTORY_KEY) as { runId: string }).runId).toBe(
      'run-1',
    );
  });

  it('refuses a member without a LinkedIn connection', async () => {
    mocks.listConnections.mockResolvedValue([]);

    await expect(syncHistory()).rejects.toThrow(
      'Connect your LinkedIn account first.',
    );
  });
});
