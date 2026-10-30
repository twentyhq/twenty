import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ listUnipileChats: vi.fn() }));

vi.mock('src/unipile/utils/list-unipile-chats.util', () => ({
  listUnipileChats: mocks.listUnipileChats,
}));

const { countUnipileChats } =
  await import('src/unipile/utils/count-unipile-chats.util');

const buildChats = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: `chat-${index}` }));

describe('countUnipileChats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the total the provider returns', async () => {
    mocks.listUnipileChats.mockResolvedValue({
      items: buildChats(100),
      nextCursor: 'cursor-2',
      totalCount: 1180,
    });

    await expect(countUnipileChats('acc_1')).resolves.toBe(1180);
    expect(mocks.listUnipileChats).toHaveBeenCalledTimes(1);
  });

  it('walks the chat list when the provider returns no total', async () => {
    mocks.listUnipileChats
      .mockResolvedValueOnce({ items: buildChats(100), nextCursor: 'cursor-2' })
      .mockResolvedValueOnce({ items: buildChats(100), nextCursor: 'cursor-3' })
      .mockResolvedValueOnce({ items: buildChats(42), nextCursor: undefined });

    await expect(countUnipileChats('acc_1')).resolves.toBe(242);
    expect(mocks.listUnipileChats).toHaveBeenLastCalledWith({
      accountId: 'acc_1',
      cursor: 'cursor-3',
      limit: 100,
    });
  });
});
