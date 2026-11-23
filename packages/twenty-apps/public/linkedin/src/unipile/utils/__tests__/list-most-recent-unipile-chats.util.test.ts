import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ listUnipileChats: vi.fn() }));

vi.mock('src/unipile/utils/list-unipile-chats.util', () => ({
  listUnipileChats: mocks.listUnipileChats,
}));

const { listMostRecentUnipileChats } =
  await import('src/unipile/utils/list-most-recent-unipile-chats.util');

const buildChat = ({ id, day }: { id: string; day: number }) => ({
  id,
  last_message_timestamp: `2026-10-${String(day).padStart(2, '0')}T00:00:00.000Z`,
});

describe('listMostRecentUnipileChats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists once a conversation two inboxes both return', async () => {
    mocks.listUnipileChats
      .mockResolvedValueOnce({
        items: [
          buildChat({ id: 'a', day: 20 }),
          buildChat({ id: 'b', day: 19 }),
        ],
        nextCursor: undefined,
      })
      .mockResolvedValueOnce({
        items: [
          buildChat({ id: 'b', day: 19 }),
          buildChat({ id: 'c', day: 18 }),
        ],
        nextCursor: undefined,
      });

    const chats = await listMostRecentUnipileChats({
      accountId: 'acc_1',
      inboxIds: ['inbox-1', 'inbox-2'],
      limit: 3,
    });

    expect(chats.map((chat) => chat.id)).toEqual(['a', 'b', 'c']);
  });
});
