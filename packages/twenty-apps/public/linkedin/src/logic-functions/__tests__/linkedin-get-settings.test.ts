import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
  listMessageChannels: vi.fn(),
  getJobs: vi.fn(),
  kvStore: new Map<string, unknown>(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  listConnections: mocks.listConnections,
  listMessageChannels: mocks.listMessageChannels,
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

const { linkedinGetSettingsHandler } =
  await import('src/logic-functions/linkedin-get-settings');

const getSettings = (body: Record<string, unknown> = {}) =>
  linkedinGetSettingsHandler(
    { body },
    { userWorkspaceId: 'member-user-workspace-id' },
  );

describe('linkedinGetSettingsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.listConnections.mockResolvedValue([
      {
        id: 'personal-connection-id',
        name: 'Ada Lovelace',
        handle: 'https://www.linkedin.com/in/ada',
        userWorkspaceId: 'member-user-workspace-id',
        authFailedAt: null,
      },
      {
        id: 'other-connection-id',
        name: 'Grace Hopper',
        handle: 'https://www.linkedin.com/in/grace',
        userWorkspaceId: 'other-user-workspace-id',
        authFailedAt: null,
      },
      {
        id: 'company-connection-id',
        name: 'Ada at Analytical Engines',
        handle: 'https://www.linkedin.com/in/ada-company',
        userWorkspaceId: 'member-user-workspace-id',
        authFailedAt: '2026-11-01T00:00:00.000Z',
      },
    ]);
    mocks.listMessageChannels.mockResolvedValue([]);
    mocks.kvStore.set('linkedin-settings:personal-connection-id', {
      importPolicy: 'CONTACTS_ONLY',
    });
  });

  it('lists every connection of the member and shows the first one by default', async () => {
    await expect(getSettings()).resolves.toEqual(
      expect.objectContaining({
        connection: expect.objectContaining({ id: 'company-connection-id' }),
        connections: [
          {
            id: 'company-connection-id',
            name: 'Ada at Analytical Engines',
            handle: 'https://www.linkedin.com/in/ada-company',
            isAuthFailed: true,
          },
          {
            id: 'personal-connection-id',
            name: 'Ada Lovelace',
            handle: 'https://www.linkedin.com/in/ada',
            isAuthFailed: false,
          },
        ],
      }),
    );
  });

  it('shows the settings of the requested connection', async () => {
    await expect(
      getSettings({ connectedAccountId: 'personal-connection-id' }),
    ).resolves.toEqual(
      expect.objectContaining({
        connection: expect.objectContaining({ id: 'personal-connection-id' }),
        settings: expect.objectContaining({ importPolicy: 'CONTACTS_ONLY' }),
      }),
    );
  });

  it('falls back to the first connection when the requested one is gone or not the member own', async () => {
    await expect(
      getSettings({ connectedAccountId: 'other-connection-id' }),
    ).resolves.toEqual(
      expect.objectContaining({
        connection: expect.objectContaining({ id: 'company-connection-id' }),
      }),
    );
  });

  it('says the member is not connected when they have no LinkedIn connection', async () => {
    mocks.listConnections.mockResolvedValue([]);

    await expect(getSettings()).resolves.toEqual({ isConnected: false });
  });
});
