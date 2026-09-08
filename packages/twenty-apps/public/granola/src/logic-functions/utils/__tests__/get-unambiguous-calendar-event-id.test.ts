import { describe, expect, it } from 'vitest';

import { getUnambiguousCalendarEventId } from 'src/logic-functions/utils/get-unambiguous-calendar-event-id.util';

describe('getUnambiguousCalendarEventId', () => {
  it('accepts multiple synchronized calendar associations for the same event', () => {
    expect(getUnambiguousCalendarEventId(['event-1', 'event-1', null])).toBe(
      'event-1',
    );
  });

  it('leaves competing event matches unlinked', () => {
    expect(
      getUnambiguousCalendarEventId(['event-1', 'event-2']),
    ).toBeUndefined();
  });

  it('leaves absent matches unlinked', () => {
    expect(getUnambiguousCalendarEventId([null, ''])).toBeUndefined();
  });
});
