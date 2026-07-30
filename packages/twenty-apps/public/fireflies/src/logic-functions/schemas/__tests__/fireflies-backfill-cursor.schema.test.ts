import { describe, expect, it } from 'vitest';

import { firefliesBackfillCursorSchema } from 'src/logic-functions/schemas/fireflies-backfill-cursor.schema';

describe('firefliesBackfillCursorSchema', () => {
  it('accepts a complete continuation cursor', () => {
    expect(
      firefliesBackfillCursorSchema.safeParse({
        fromDate: '2026-05-01T00:00:00.000Z',
        toDate: '2026-07-30T00:00:00.000Z',
        skip: 50,
      }).success,
    ).toBe(true);
  });

  it.each([
    null,
    {},
    {
      fromDate: 'not-a-date',
      toDate: '2026-07-30T00:00:00.000Z',
      skip: 0,
    },
    {
      fromDate: '2026-05-01T00:00:00.000Z',
      toDate: 'not-a-date',
      skip: 0,
    },
    {
      fromDate: '2026-05-01T00:00:00.000Z',
      toDate: '2026-07-30T00:00:00.000Z',
      skip: -1,
    },
    {
      fromDate: '2026-05-01T00:00:00.000Z',
      toDate: '2026-07-30T00:00:00.000Z',
      skip: 1.5,
    },
    {
      fromDate: '2026-07-31T00:00:00.000Z',
      toDate: '2026-07-30T00:00:00.000Z',
      skip: 0,
    },
    {
      fromDate: '2026-05-01T00:00:00.000Z',
      toDate: '2026-07-30T00:00:00.000Z',
      skip: 2_147_483_648,
    },
  ])('rejects an invalid continuation cursor', (cursor) => {
    expect(firefliesBackfillCursorSchema.safeParse(cursor).success).toBe(false);
  });
});
