import { describe, expect, it } from 'vitest';

import { getSingleDistinctCalendarEventId } from 'src/logic-functions/utils/get-single-distinct-calendar-event-id.util';

describe('getSingleDistinctCalendarEventId', () => {
  it('accepts multiple synchronized calendar associations for the same event', () => {
    expect(getSingleDistinctCalendarEventId(['event-1', 'event-1', null])).toBe(
      'event-1',
    );
  });

  it('leaves competing event matches unlinked', () => {
    expect(
      getSingleDistinctCalendarEventId(['event-1', 'event-2']),
    ).toBeUndefined();
  });

  it('leaves absent matches unlinked', () => {
    expect(getSingleDistinctCalendarEventId([null, ''])).toBeUndefined();
  });
});
