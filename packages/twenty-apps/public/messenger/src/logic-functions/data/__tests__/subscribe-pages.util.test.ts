import { describe, expect, it, vi } from 'vitest';

import { subscribePages } from 'src/logic-functions/data/subscribe-pages.util';

const { subscribePage } = vi.hoisted(() => ({ subscribePage: vi.fn() }));

vi.mock('src/logic-functions/data/subscribe-page.util', () => ({
  subscribePage,
}));

const PAGES = [
  { id: 'page-1', name: 'Acme', access_token: 'token-1' },
  { id: 'page-2', name: 'Acme Support', access_token: 'token-2' },
  { id: 'page-3', name: 'Acme Shop', access_token: 'token-3' },
];

describe('subscribePages', () => {
  it('keeps subscribing the other Pages when one is refused', async () => {
    subscribePage.mockImplementation(async ({ pageId }: { pageId: string }) => {
      if (pageId === 'page-2') {
        throw new Error('Messenger API error 200: permission missing');
      }
    });

    const failures = await subscribePages(PAGES);

    expect(subscribePage).toHaveBeenCalledTimes(3);
    expect(failures).toEqual([
      {
        page: PAGES[1],
        reason: 'Messenger API error 200: permission missing',
      },
    ]);
  });
});
