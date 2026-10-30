import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  enqueueJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
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

const CONTEXT = { userWorkspaceId: 'member-user-workspace-id' };

const updateSettings = (body: Record<string, unknown>) =>
  linkedinUpdateSettingsHandler({ body } as never, CONTEXT);

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
    mocks.kvStore.set('linkedin-history-import:connection-id', {
      runId: 'run-1',
      importRange: 'LAST_90_DAYS',
      status: 'COMPLETED',
      importedConversationCount: 12,
      startedAt: '2026-10-01T00:00:00.000Z',
    });
  });

  it('saves the valid fields of the member connection and ignores the others', async () => {
    const view = await updateSettings({
      contactAutoCreationPolicy: 'NONE',
      isNameMatchingEnabled: 'yes',
      importRange: 'LAST_2_DAYS',
    });

    expect(view).toEqual(
      expect.objectContaining({
        isConnected: true,
        settings: {
          importRange: 'LAST_90_DAYS',
          contactAutoCreationPolicy: 'NONE',
          isNameMatchingEnabled: true,
          areGroupConversationsExcluded: false,
        },
      }),
    );
    expect(mocks.kvStore.has('linkedin-settings:other-connection-id')).toBe(
      false,
    );
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('imports more history when the range grows', async () => {
    await updateSettings({ importRange: 'ALL' });

    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
    expect(mocks.kvStore.get('linkedin-history-import:connection-id')).toEqual(
      expect.objectContaining({ importRange: 'ALL', status: 'IMPORTING' }),
    );
  });

  it('does not re-import when the range shrinks', async () => {
    await updateSettings({ importRange: 'LAST_30_DAYS' });

    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });
});
