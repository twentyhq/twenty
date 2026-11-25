import { describe, expect, it, vi } from 'vitest';

import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';

const buildPage = ({
  ids,
  endCursor,
}: {
  ids: string[];
  endCursor?: string | null;
}) => ({
  telegramUserLinks: {
    edges: ids.map((id) => ({
      node: { id, telegramUserId: '42', workspaceMemberId: null },
    })),
    pageInfo: { hasNextPage: endCursor !== undefined, endCursor },
  },
});

describe('findTelegramUserLinks', () => {
  it('follows pages until the last one', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(buildPage({ ids: ['link-1'], endCursor: 'c-1' }))
      .mockResolvedValueOnce(buildPage({ ids: ['link-2'] }));

    await expect(findTelegramUserLinks({ client: { query } })).resolves.toEqual(
      [
        { id: 'link-1', telegramUserId: '42', workspaceMemberId: undefined },
        { id: 'link-2', telegramUserId: '42', workspaceMemberId: undefined },
      ],
    );
    expect(query.mock.calls[1][0].telegramUserLinks.__args.after).toBe('c-1');
  });

  it('fails instead of returning a truncated list when a cursor is missing', async () => {
    const query = vi
      .fn()
      .mockResolvedValue(buildPage({ ids: ['link-1'], endCursor: null }));

    await expect(findTelegramUserLinks({ client: { query } })).rejects.toThrow(
      'A page announced a next page without a cursor',
    );
  });

  it('keeps an empty filter value instead of matching every link', async () => {
    const query = vi.fn().mockResolvedValue(buildPage({ ids: [] }));

    await findTelegramUserLinks({
      client: { query },
      filter: { telegramUserId: '' },
    });

    expect(query.mock.calls[0][0].telegramUserLinks.__args.filter).toEqual({
      telegramUserId: { eq: '' },
    });
  });
});
