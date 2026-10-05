import { describe, expect, it } from 'vitest';

import { getGranolaNextPage } from 'src/logic-functions/utils/get-granola-next-page.util';

describe('getGranolaNextPage', () => {
  it('does not follow a cursor after the final page', () => {
    expect(
      getGranolaNextPage({ hasMore: false, cursor: 'stale', pageIndex: 0 }),
    ).toEqual({ kind: 'complete' });
  });

  it.each([
    { cursor: null, pageIndex: 0 },
    { cursor: 'same', previousCursor: 'same', pageIndex: 0 },
    { cursor: 'next', pageIndex: 999 },
  ])(
    'reports a stalled import for a repeated, missing, or bounded cursor',
    (parameters) => {
      expect(
        getGranolaNextPage({ hasMore: true, ...parameters }),
      ).toMatchObject({ kind: 'stalled', reason: expect.any(String) });
    },
  );

  it('continues a valid next page', () => {
    expect(
      getGranolaNextPage({
        hasMore: true,
        cursor: 'next',
        previousCursor: 'previous',
        pageIndex: 1,
      }),
    ).toEqual({ kind: 'next', cursor: 'next' });
  });
});
