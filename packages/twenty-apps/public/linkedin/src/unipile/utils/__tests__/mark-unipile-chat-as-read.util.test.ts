import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const mocks = vi.hoisted(() => ({ updateChat: vi.fn(), wait: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileMessaging: class {
    updateChat = mocks.updateChat;
  },
}));

vi.mock('src/unipile/utils/get-unipile-request-options.util', () => ({
  getUnipileRequestOptions: () => ({ auth: 'key', throwOnError: true }),
}));

vi.mock('src/utils/wait.util', () => ({ wait: mocks.wait }));

const { markUnipileChatAsRead } =
  await import('src/unipile/utils/mark-unipile-chat-as-read.util');

const markAsRead = () =>
  markUnipileChatAsRead({ accountId: 'acc_1', chatId: 'chat-1' });

describe('markUnipileChatAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks the chat as read', async () => {
    mocks.updateChat.mockResolvedValue({ data: { object: 'ChatPatched' } });

    await expect(markAsRead()).resolves.toBeUndefined();
    expect(mocks.updateChat).toHaveBeenCalledExactlyOnceWith({
      auth: 'key',
      throwOnError: true,
      path: { account_id: 'acc_1', chat_id: 'chat-1' },
      body: { read_status: true },
    });
  });

  it('fails a rate-limited call right away instead of waiting', async () => {
    mocks.updateChat.mockRejectedValue({
      status: 429,
      title: 'Too many requests',
      detail: 'Please retry in 30 seconds',
    });

    await expect(markAsRead()).rejects.toBeInstanceOf(UnipileRateLimitError);
    expect(mocks.updateChat).toHaveBeenCalledOnce();
    expect(mocks.wait).not.toHaveBeenCalled();
  });

  it('reports what Unipile refused', async () => {
    mocks.updateChat.mockRejectedValue({ status: 404, title: 'Not found' });

    await expect(markAsRead()).rejects.toThrow(
      'Unipile mark chat as read failed (404): Not found',
    );
  });
});
