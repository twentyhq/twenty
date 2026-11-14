import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const mocks = vi.hoisted(() => ({ startChat: vi.fn(), wait: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileMessaging: class {
    startChat = mocks.startChat;
  },
}));

vi.mock('src/unipile/utils/get-unipile-request-options.util', () => ({
  getUnipileRequestOptions: () => ({ auth: 'key', throwOnError: true }),
}));

vi.mock('src/utils/wait.util', () => ({ wait: mocks.wait }));

const { startUnipileChatOrThrow } =
  await import('src/unipile/utils/start-unipile-chat-or-throw.util');

const start = () =>
  startUnipileChatOrThrow({
    accountId: 'acc_1',
    userId: 'ACoAAA123',
    text: 'Hi Grace, nice to meet you',
  });

describe('startUnipileChatOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts a one to one chat with the user and returns the chat and message ids', async () => {
    mocks.startChat.mockResolvedValue({
      data: {
        object: 'ChatStarted',
        chat_id: 'chat-1',
        message_id: 'message-1',
      },
    });

    await expect(start()).resolves.toEqual({
      chatId: 'chat-1',
      messageId: 'message-1',
    });
    expect(mocks.startChat).toHaveBeenCalledExactlyOnceWith({
      auth: 'key',
      throwOnError: true,
      path: { account_id: 'acc_1' },
      body: { text: 'Hi Grace, nice to meet you', users_ids: 'ACoAAA123' },
    });
  });

  it('returns the first message id when Unipile reports several', async () => {
    mocks.startChat.mockResolvedValue({
      data: {
        object: 'ChatStarted',
        chat_id: 'chat-1',
        message_id: ['message-1', 'message-2'],
      },
    });

    await expect(start()).resolves.toEqual({
      chatId: 'chat-1',
      messageId: 'message-1',
    });
  });

  it('fails when Unipile returns no message id', async () => {
    mocks.startChat.mockResolvedValue({
      data: { object: 'ChatStarted', chat_id: 'chat-1', message_id: null },
    });

    await expect(start()).rejects.toThrow(
      'Unipile started a chat with user ACoAAA123 but returned no chat or message id',
    );
  });

  it('fails a rate-limited start right away instead of waiting', async () => {
    mocks.startChat.mockRejectedValue({
      status: 429,
      title: 'Too many requests',
      detail: 'Please retry in 30 seconds',
    });

    await expect(start()).rejects.toBeInstanceOf(UnipileRateLimitError);
    expect(mocks.startChat).toHaveBeenCalledOnce();
    expect(mocks.wait).not.toHaveBeenCalled();
  });
});
