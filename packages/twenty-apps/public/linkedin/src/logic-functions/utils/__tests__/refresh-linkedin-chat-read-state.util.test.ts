import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUnipileChat: vi.fn(),
  mutation: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    mutation = mocks.mutation;
  },
}));

vi.mock('src/unipile/utils/get-unipile-chat.util', () => ({
  getUnipileChat: mocks.getUnipileChat,
}));

const { refreshLinkedinChatReadState } =
  await import('src/logic-functions/utils/refresh-linkedin-chat-read-state.util');

describe('refreshLinkedinChatReadState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('applies the read state LinkedIn reports now', async () => {
    mocks.getUnipileChat.mockResolvedValue({ id: 'chat-1', unread_count: -1 });

    await refreshLinkedinChatReadState({
      unipileAccountId: 'acc_1',
      messageChannelId: 'channel-id',
      chatId: 'chat-1',
    });

    expect(mocks.getUnipileChat).toHaveBeenCalledExactlyOnceWith({
      accountId: 'acc_1',
      chatId: 'chat-1',
    });
    expect(mocks.mutation).toHaveBeenCalledExactlyOnceWith({
      setAppMessageThreadReadState: {
        __args: {
          input: {
            messageChannelId: 'channel-id',
            threadExternalId: 'chat-1',
            isRead: false,
          },
        },
        updatedMessageCount: true,
      },
    });
  });

  it('does not fail the caller when Unipile cannot be reached', async () => {
    mocks.getUnipileChat.mockRejectedValue(new Error('Unipile is down'));

    await expect(
      refreshLinkedinChatReadState({
        unipileAccountId: 'acc_1',
        messageChannelId: 'channel-id',
        chatId: 'chat-1',
      }),
    ).resolves.toBeUndefined();
    expect(mocks.mutation).not.toHaveBeenCalled();
  });
});
