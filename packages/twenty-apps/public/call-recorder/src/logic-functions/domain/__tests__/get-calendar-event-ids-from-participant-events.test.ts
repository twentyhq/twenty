import { describe, expect, it } from 'vitest';

import { getCalendarEventIdsFromParticipantEvents } from 'src/logic-functions/domain/get-calendar-event-ids-from-participant-events.util';

describe('getCalendarEventIdsFromParticipantEvents', () => {
  it('returns each calendar event once, whether a participant was added, changed or removed', () => {
    expect(
      getCalendarEventIdsFromParticipantEvents([
        {
          eventId: 'database-event-1',
          recordId: 'participant-1',
          properties: {
            after: { id: 'participant-1', calendarEventId: 'calendar-event-2' },
          },
        },
        {
          eventId: 'database-event-2',
          recordId: 'participant-2',
          properties: {
            before: {
              id: 'participant-2',
              calendarEventId: 'calendar-event-1',
            },
            after: { id: 'participant-2', calendarEventId: 'calendar-event-1' },
          },
        },
        {
          eventId: 'database-event-3',
          recordId: 'participant-3',
          properties: {
            before: {
              id: 'participant-3',
              calendarEventId: 'calendar-event-2',
            },
          },
        },
      ]),
    ).toEqual(['calendar-event-1', 'calendar-event-2']);
  });

  it('returns nothing when no participant names its calendar event', () => {
    expect(
      getCalendarEventIdsFromParticipantEvents([
        {
          eventId: 'database-event-1',
          recordId: 'participant-1',
          properties: {},
        },
      ]),
    ).toEqual([]);
  });
});
