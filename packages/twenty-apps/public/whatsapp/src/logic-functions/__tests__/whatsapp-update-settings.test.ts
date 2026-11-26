import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  listMessageChannels: vi.fn(),
  updateMessageChannel: vi.fn(),
  enqueueJobs: vi.fn(),
  getJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
  listMessageChannels: mocks.listMessageChannels,
  updateMessageChannel: mocks.updateMessageChannel,
  enqueueJobs: mocks.enqueueJobs,
  getJobs: mocks.getJobs,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
    delete: async (key: string) => {
      mocks.kvStore.delete(key);
    },
  },
}));

const { whatsappUpdateSettingsHandler } =
  await import('src/logic-functions/whatsapp-update-settings');

const HISTORY_KEY = 'whatsapp-history-import:connection-id';

const updateSettings = (body: Record<string, unknown>) =>
  whatsappUpdateSettingsHandler(
    { body },
    {
      userWorkspaceId: 'member-user-workspace-id',
    },
  );

const setHistoryImport = (status: 'COMPLETED' | 'IMPORTING') =>
  mocks.kvStore.set(HISTORY_KEY, {
    runId: 'run-1',
    importPolicy: 'CONTACTS_ONLY',
    conversationLimit: 100,
    status,
    importedConversationCount: 12,
    startedAt: '2026-10-01T00:00:00.000Z',
  });

describe('whatsappUpdateSettingsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.listConnections.mockResolvedValue([
      {
        id: 'other-connection-id',
        userWorkspaceId: 'other-user-workspace-id',
      },
      {
        id: 'connection-id',
        name: 'Ada Lovelace',
        handle: '+33611111111',
        userWorkspaceId: 'member-user-workspace-id',
        authFailedAt: null,
      },
    ]);
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', visibility: 'METADATA' },
    ]);
    mocks.getJobs.mockImplementation(async (jobIds: string[]) =>
      jobIds.map((jobId) => ({ jobId, state: 'DELAYED' })),
    );
    setHistoryImport('COMPLETED');
  });

  it('saves the valid fields of the member connection and ignores the others', async () => {
    const view = await updateSettings({
      contactAutoCreationPolicy: 'NONE',
      areChatsMarkedAsRead: 'yes',
      importPolicy: 'SOME',
    });

    expect(view).toEqual(
      expect.objectContaining({
        isConnected: true,
        settings: {
          importPolicy: 'CONTACTS_ONLY',
          selectedChats: [],
          contactAutoCreationPolicy: 'NONE',
          areChatsMarkedAsRead: false,
          visibility: 'METADATA',
        },
      }),
    );
    expect(mocks.kvStore.has('whatsapp-settings:other-connection-id')).toBe(
      false,
    );
    expect(mocks.updateMessageChannel).not.toHaveBeenCalled();
  });

  it('saves whether chats opened in Twenty are marked as read on WhatsApp', async () => {
    const view = await updateSettings({ areChatsMarkedAsRead: true });

    expect(view).toEqual(
      expect.objectContaining({
        settings: expect.objectContaining({ areChatsMarkedAsRead: true }),
      }),
    );
    expect(mocks.kvStore.get('whatsapp-settings:connection-id')).toEqual(
      expect.objectContaining({ areChatsMarkedAsRead: true }),
    );
  });

  it('applies the visibility to the message channel instead of the kv settings', async () => {
    await updateSettings({ visibility: 'SHARE_EVERYTHING' });

    expect(mocks.updateMessageChannel).toHaveBeenCalledExactlyOnceWith({
      id: 'channel-id',
      visibility: 'SHARE_EVERYTHING',
    });
    expect(
      mocks.kvStore.get('whatsapp-settings:connection-id'),
    ).not.toHaveProperty('visibility');
  });

  it.each([[{ importPolicy: 'ALL' }], [{ contactAutoCreationPolicy: 'NONE' }]])(
    'imports the past conversations again when saving %o',
    async (update) => {
      const view = await updateSettings(update);

      expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ delayMs: 15 * 1000 }),
      );
      expect(view).toEqual(
        expect.objectContaining({
          historyImport: expect.objectContaining({ status: 'IMPORTING' }),
        }),
      );
      expect(mocks.kvStore.get(HISTORY_KEY)).toEqual(
        expect.objectContaining({
          runId: expect.not.stringMatching(/^run-1$/),
        }),
      );
    },
  );

  it.each([
    [{ importPolicy: 'CONTACTS_ONLY' }],
    [{ visibility: 'SHARE_EVERYTHING' }],
    [{ areChatsMarkedAsRead: true }],
  ])('leaves the past conversations alone when saving %o', async (update) => {
    await updateSettings(update);

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(HISTORY_KEY)).toEqual(
      expect.objectContaining({ runId: 'run-1', status: 'COMPLETED' }),
    );
  });

  it('replaces a running import and drops what it had listed', async () => {
    setHistoryImport('IMPORTING');
    mocks.kvStore.set('whatsapp-history-import-planning:connection-id:run-1', {
      plannedChunkCount: 1,
      plannedConversationCount: 20,
    });

    await updateSettings({ importPolicy: 'ALL' });

    expect(mocks.enqueueJobs).toHaveBeenCalledOnce();
    expect(
      mocks.kvStore.has('whatsapp-history-import-planning:connection-id:run-1'),
    ).toBe(false);
    expect(mocks.kvStore.get(HISTORY_KEY)).toEqual(
      expect.objectContaining({ status: 'IMPORTING', importPolicy: 'ALL' }),
    );
  });

  it('stops a running import once no conversation is selected', async () => {
    setHistoryImport('IMPORTING');

    await updateSettings({ importPolicy: 'SELECTED' });

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.kvStore.get(HISTORY_KEY)).toEqual(
      expect.objectContaining({ runId: 'run-1', status: 'CANCELLED' }),
    );
  });
});
