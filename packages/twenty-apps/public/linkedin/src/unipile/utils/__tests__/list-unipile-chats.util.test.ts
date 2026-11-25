import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getInboxChatsList: vi.fn() }));

vi.mock('@unipile/sdk', () => ({
  UnipileMessaging: class {
    getInboxChatsList = mocks.getInboxChatsList;
  },
}));

vi.mock('src/unipile/utils/get-unipile-request-options.util', () => ({
  getUnipileRequestOptions: () => ({ auth: 'key', throwOnError: true }),
}));

const { listUnipileChats } =
  await import('src/unipile/utils/list-unipile-chats.util');

describe('listUnipileChats', () => {
  it('caps the page size at the 25 chats Unipile allows for LinkedIn', async () => {
    mocks.getInboxChatsList.mockResolvedValue({
      data: { data: [], next_cursor: null, total_count: 0 },
    });

    await listUnipileChats({
      accountId: 'acc_1',
      inboxId: 'inbox-1',
      limit: 50,
    });

    expect(mocks.getInboxChatsList).toHaveBeenCalledWith(
      expect.objectContaining({ query: { cursor: undefined, limit: 25 } }),
    );
  });
});
