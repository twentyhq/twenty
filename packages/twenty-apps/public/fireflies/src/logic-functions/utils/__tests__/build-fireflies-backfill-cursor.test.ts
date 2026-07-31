import { describe, expect, it } from 'vitest';

import { buildFirefliesBackfillCursor } from 'src/logic-functions/utils/build-fireflies-backfill-cursor.util';

describe('buildFirefliesBackfillCursor', () => {
  it('creates a date window ending now for the requested days', () => {
    const nowMilliseconds = Date.parse('2026-07-30T00:00:00.000Z');

    expect(
      buildFirefliesBackfillCursor({ windowDays: 30, nowMilliseconds }),
    ).toEqual({
      fromDate: '2026-06-30T00:00:00.000Z',
      toDate: '2026-07-30T00:00:00.000Z',
      skip: 0,
    });
  });
});
