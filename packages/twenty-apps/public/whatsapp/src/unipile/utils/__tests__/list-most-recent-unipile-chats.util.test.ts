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

  it('lists a chat once when Unipile returns it on two pages, and asks for the missing ones', async () => {
    mocks.listUnipileChats
      .mockResolvedValueOnce({
        items: [
          buildChat({ id: 'a', day: 20 }),
          buildChat({ id: 'b', day: 19 }),
        ],
        nextCursor: 'page-2',
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
      limit: 3,
    });

    expect(chats.map((chat) => chat.id)).toEqual(['a', 'b', 'c']);
    expect(
      mocks.listUnipileChats.mock.calls.map(([input]) => input.limit),
    ).toEqual([3, 1]);
  });
});
