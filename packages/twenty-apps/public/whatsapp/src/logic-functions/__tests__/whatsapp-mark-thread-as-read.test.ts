import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getConnection: vi.fn(),
  markUnipileChatAsRead: vi.fn(),
  kvStore: new Map<string, { areChatsMarkedAsRead: boolean }>(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  getConnection: mocks.getConnection,
  kv: {
    get: async (key: string) => mocks.kvStore.get(key) ?? null,
  },
}));

vi.mock('src/unipile/utils/mark-unipile-chat-as-read.util', () => ({
  markUnipileChatAsRead: mocks.markUnipileChatAsRead,
}));

const { whatsappMarkThreadAsReadHandler } =
  await import('src/logic-functions/whatsapp-mark-thread-as-read');

const PAYLOAD = {
  messagingProviderName: 'whatsapp-messaging',
  connectedAccountId: 'connected-account-id',
  messageChannelId: 'channel-id',
  threadExternalId: 'chat-1',
};

const SETTINGS_KEY = 'whatsapp-settings:connected-account-id';

describe('whatsappMarkThreadAsReadHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.kvStore.clear();
    mocks.kvStore.set(SETTINGS_KEY, { areChatsMarkedAsRead: true });
    mocks.getConnection.mockResolvedValue({ externalAccountId: 'acc_1' });
    mocks.markUnipileChatAsRead.mockResolvedValue(undefined);
  });

  it('marks the Unipile chat of the thread as read', async () => {
    await whatsappMarkThreadAsReadHandler(PAYLOAD);

    expect(mocks.getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(mocks.markUnipileChatAsRead).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
    });
  });

  it('leaves WhatsApp untouched by default', async () => {
    mocks.kvStore.clear();

    await whatsappMarkThreadAsReadHandler(PAYLOAD);

    expect(mocks.getConnection).not.toHaveBeenCalled();
    expect(mocks.markUnipileChatAsRead).not.toHaveBeenCalled();
  });

  it('leaves WhatsApp untouched when the member turned it off', async () => {
    mocks.kvStore.set(SETTINGS_KEY, { areChatsMarkedAsRead: false });

    await whatsappMarkThreadAsReadHandler(PAYLOAD);

    expect(mocks.markUnipileChatAsRead).not.toHaveBeenCalled();
  });

  it('refuses a connection without a Unipile account', async () => {
    mocks.getConnection.mockResolvedValue({ externalAccountId: null });

    await expect(whatsappMarkThreadAsReadHandler(PAYLOAD)).rejects.toThrow(
      'WhatsApp connection connected-account-id has no Unipile account',
    );
    expect(mocks.markUnipileChatAsRead).not.toHaveBeenCalled();
  });

  it('fails when Unipile does', async () => {
    mocks.markUnipileChatAsRead.mockRejectedValue(
      new Error('Unipile mark chat as read failed (403): Forbidden'),
    );

    await expect(whatsappMarkThreadAsReadHandler(PAYLOAD)).rejects.toThrow(
      'Unipile mark chat as read failed (403): Forbidden',
    );
  });
});
