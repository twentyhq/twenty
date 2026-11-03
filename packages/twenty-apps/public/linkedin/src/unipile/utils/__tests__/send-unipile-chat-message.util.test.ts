import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const mocks = vi.hoisted(() => ({ sendMessage: vi.fn(), wait: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileMessaging: class {
    sendMessage = mocks.sendMessage;
  },
}));

vi.mock('src/unipile/utils/get-unipile-request-options.util', () => ({
  getUnipileRequestOptions: () => ({ auth: 'key', throwOnError: true }),
}));

vi.mock('src/utils/wait.util', () => ({ wait: mocks.wait }));

const { sendUnipileChatMessage } =
  await import('src/unipile/utils/send-unipile-chat-message.util');

const send = () =>
  sendUnipileChatMessage({
    accountId: 'acc_1',
    chatId: 'chat-1',
    text: 'Thanks, talk soon',
  });

describe('sendUnipileChatMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the text to the chat and returns the sent message id', async () => {
    mocks.sendMessage.mockResolvedValue({
      data: { object: 'MessageSent', message_id: 'message-1' },
    });

    await expect(send()).resolves.toBe('message-1');
    expect(mocks.sendMessage).toHaveBeenCalledExactlyOnceWith({
      auth: 'key',
      throwOnError: true,
      path: { account_id: 'acc_1', chat_id: 'chat-1' },
      body: { text: 'Thanks, talk soon' },
    });
  });

  it('returns the first id when Unipile reports several', async () => {
    mocks.sendMessage.mockResolvedValue({
      data: { object: 'MessageSent', message_id: ['message-1', 'message-2'] },
    });

    await expect(send()).resolves.toBe('message-1');
  });

  it('fails when Unipile returns no message id', async () => {
    mocks.sendMessage.mockResolvedValue({
      data: { object: 'MessageSent', message_id: null },
    });

    await expect(send()).rejects.toThrow(
      'Unipile accepted the message to chat chat-1 but returned no message id',
    );
  });

  it('fails a rate-limited send right away instead of waiting', async () => {
    mocks.sendMessage.mockRejectedValue({
      status: 429,
      title: 'Too many requests',
      detail: 'Please retry in 30 seconds',
    });

    await expect(send()).rejects.toBeInstanceOf(UnipileRateLimitError);
    expect(mocks.sendMessage).toHaveBeenCalledOnce();
    expect(mocks.wait).not.toHaveBeenCalled();
  });
});
