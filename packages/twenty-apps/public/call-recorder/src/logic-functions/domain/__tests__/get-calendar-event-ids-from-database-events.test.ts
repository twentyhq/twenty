import { describe, expect, it } from 'vitest';

import { getCalendarEventIdsFromDatabaseEvents } from 'src/logic-functions/domain/get-calendar-event-ids-from-database-events.util';

describe('getCalendarEventIdsFromDatabaseEvents', () => {
  it('returns each calendar event once, whether a record was added, changed or removed', () => {
    expect(
      getCalendarEventIdsFromDatabaseEvents([
        {
          properties: {
            after: { calendarEventId: 'calendar-event-2' },
          },
        },
        {
          properties: {
            before: {
              calendarEventId: 'calendar-event-1',
            },
            after: { calendarEventId: 'calendar-event-1' },
          },
        },
        {
          properties: {
            before: {
              calendarEventId: 'calendar-event-2',
            },
          },
        },
      ]),
    ).toEqual(['calendar-event-1', 'calendar-event-2']);
  });

  it('returns nothing when no record names its calendar event', () => {
    expect(
      getCalendarEventIdsFromDatabaseEvents([
        {
          properties: {},
        },
      ]),
    ).toEqual([]);
  });
});
