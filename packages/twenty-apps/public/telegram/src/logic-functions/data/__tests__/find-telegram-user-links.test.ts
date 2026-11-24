import { describe, expect, it, vi } from 'vitest';

import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';

describe('findTelegramUserLinks', () => {
  it('follows pages until the last one', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        telegramUserLinks: {
          edges: [
            {
              node: {
                id: 'link-1',
                telegramUserId: '42',
                workspaceMemberId: 'member-1',
              },
            },
          ],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      })
      .mockResolvedValueOnce({
        telegramUserLinks: {
          edges: [
            {
              node: {
                id: 'link-2',
                telegramUserId: '',
                workspaceMemberId: null,
              },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: 'cursor-2' },
        },
      });

    await expect(
      findTelegramUserLinks({
        client: { query },
        filter: { workspaceMemberId: undefined, telegramUserId: '42' },
      }),
    ).resolves.toEqual([
      { id: 'link-1', telegramUserId: '42', workspaceMemberId: 'member-1' },
      { id: 'link-2', telegramUserId: undefined, workspaceMemberId: undefined },
    ]);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0].telegramUserLinks.__args).toEqual({
      filter: { telegramUserId: { eq: '42' } },
      first: 100,
    });
    expect(query.mock.calls[1][0].telegramUserLinks.__args.after).toBe(
      'cursor-1',
    );
  });
});
