import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kvStore: new Map<string, unknown>(),
  listConnections: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  definePostInstallLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      mocks.kvStore.set(key, value);
    },
  },
  listConnections: mocks.listConnections,
}));

const { whatsappPostInstallHandler } =
  await import('src/logic-functions/whatsapp-post-install');

describe('whatsappPostInstallHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.listConnections.mockResolvedValue([
      { id: 'never-saved' },
      { id: 'saved-other-setting' },
      { id: 'chose-selected' },
    ]);
    mocks.kvStore.set('whatsapp-settings:saved-other-setting', {
      areChatsMarkedAsRead: true,
    });
    mocks.kvStore.set('whatsapp-settings:chose-selected', {
      importPolicy: 'SELECTED',
    });
  });

  it('keeps members connected before the Contacts only default on All chats', async () => {
    await expect(
      whatsappPostInstallHandler({
        previousVersion: '0.1.1',
        newVersion: '0.2.0',
      }),
    ).resolves.toEqual({ keptOnAllChatsConnectionCount: 2 });

    expect(mocks.kvStore.get('whatsapp-settings:never-saved')).toEqual({
      importPolicy: 'ALL',
    });
    expect(mocks.kvStore.get('whatsapp-settings:saved-other-setting')).toEqual({
      areChatsMarkedAsRead: true,
      importPolicy: 'ALL',
    });
    expect(mocks.kvStore.get('whatsapp-settings:chose-selected')).toEqual({
      importPolicy: 'SELECTED',
    });
  });

  it.each([
    ['a fresh install', undefined],
    ['an upgrade from a version that already had the default', '0.2.0'],
  ])('changes nothing on %s', async (_label, previousVersion) => {
    await expect(
      whatsappPostInstallHandler({ previousVersion, newVersion: '0.3.0' }),
    ).resolves.toEqual({ keptOnAllChatsConnectionCount: 0 });

    expect(mocks.listConnections).not.toHaveBeenCalled();
    expect(mocks.kvStore.has('whatsapp-settings:never-saved')).toBe(false);
  });
});
