import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  listMessageChannels: vi.fn(),
  updateMessageChannel: vi.fn(),
  enqueueJobs: vi.fn(),
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
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
}));

const { linkedinUpdateSettingsHandler } =
  await import('src/logic-functions/linkedin-update-settings');

const HISTORY_KEY = 'linkedin-history-import:connection-id';

const updateSettings = (body: Record<string, unknown>) =>
  linkedinUpdateSettingsHandler({ body } as never, {
    userWorkspaceId: 'member-user-workspace-id',
  });

const setHistoryImport = (importPolicy: 'ALL' | 'CONTACTS_ONLY') =>
  mocks.kvStore.set(HISTORY_KEY, {
    runId: 'run-1',
    importPolicy,
    status: 'COMPLETED',
    importedConversationCount: 12,
    startedAt: '2026-10-01T00:00:00.000Z',
  });

describe('linkedinUpdateSettingsHandler', () => {
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
        handle: 'https://www.linkedin.com/in/ada',
        userWorkspaceId: 'member-user-workspace-id',
        authFailedAt: null,
      },
    ]);
    mocks.listMessageChannels.mockResolvedValue([
      { id: 'channel-id', visibility: 'METADATA' },
    ]);
    setHistoryImport('ALL');
  });

  it('saves the valid fields of the member connection and ignores the others', async () => {
    const view = await updateSettings({
      contactAutoCreationPolicy: 'NONE',
      isNameMatchingEnabled: 'yes',
      importPolicy: 'SOME',
      historyConversationLimit: 30,
    });

    expect(view).toEqual(
      expect.objectContaining({
        isConnected: true,
        settings: {
          importPolicy: 'ALL',
          areGroupChatsImported: true,
          historyConversationLimit: 20,
          contactAutoCreationPolicy: 'NONE',
          isNameMatchingEnabled: true,
          visibility: 'METADATA',
        },
      }),
    );
    expect(mocks.kvStore.has('linkedin-settings:other-connection-id')).toBe(
      false,
    );
    expect(mocks.updateMessageChannel).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it.each([0, 10, 20, 50])(
    'saves %i past conversations to import',
    async (historyConversationLimit) => {
      const view = await updateSettings({ historyConversationLimit });

      expect(view).toEqual(
        expect.objectContaining({
          settings: expect.objectContaining({ historyConversationLimit }),
        }),
      );
      expect(mocks.kvStore.get('linkedin-settings:connection-id')).toEqual(
        expect.objectContaining({ historyConversationLimit }),
      );
    },
  );

  it('applies the visibility to the message channel instead of the kv settings', async () => {
    await updateSettings({ visibility: 'SHARE_EVERYTHING' });

    expect(mocks.updateMessageChannel).toHaveBeenCalledExactlyOnceWith({
      id: 'channel-id',
      visibility: 'SHARE_EVERYTHING',
    });
    expect(
      mocks.kvStore.get('linkedin-settings:connection-id'),
    ).not.toHaveProperty('visibility');
  });

  it.each([
    [{ importPolicy: 'ALL' }],
    [{ importPolicy: 'CONTACTS_ONLY' }],
    [{ areGroupChatsImported: true }],
    [{ historyConversationLimit: 50 }],
  ])('leaves importing to the Sync button when saving %o', async (update) => {
    setHistoryImport('CONTACTS_ONLY');

    await updateSettings(update);

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });
});
