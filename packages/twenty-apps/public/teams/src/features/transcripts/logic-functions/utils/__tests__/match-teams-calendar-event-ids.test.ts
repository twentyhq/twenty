import { describe, expect, it } from 'vitest';

import { matchTeamsCalendarEventIds } from 'src/features/transcripts/logic-functions/utils/match-teams-calendar-event-ids';

describe('matchTeamsCalendarEventIds', () => {
  it('should match a reference through the calendar channel association of its event', () => {
    expect(
      matchTeamsCalendarEventIds({
        references: [{ eventExternalId: 'series-master-1' }],
        calendarChannelEventAssociations: [
          { eventExternalId: 'series-master-1', calendarEventId: 'calendar-1' },
          { eventExternalId: 'series-master-1', calendarEventId: 'calendar-1' },
          { eventExternalId: 'other-event', calendarEventId: 'calendar-2' },
        ],
        calendarEvents: [{ id: 'calendar-3', iCalUid: 'ical-1' }],
      }),
    ).toEqual(new Map([['series-master-1', 'calendar-1']]));
  });

  it('should fall back to the only calendar event with the iCalUId when the association is ambiguous', () => {
    expect(
      matchTeamsCalendarEventIds({
        references: [{ eventExternalId: 'event-1', iCalUId: 'ical-1' }],
        calendarChannelEventAssociations: [
          { eventExternalId: 'event-1', calendarEventId: 'calendar-1' },
          { eventExternalId: 'event-1', calendarEventId: 'calendar-2' },
        ],
        calendarEvents: [
          { id: 'calendar-3', iCalUid: 'ical-1' },
          { id: 'calendar-4', iCalUid: 'ical-2' },
        ],
      }),
    ).toEqual(new Map([['event-1', 'calendar-3']]));
  });

  it('should leave a reference unmatched when several calendar events share its iCalUId', () => {
    expect(
      matchTeamsCalendarEventIds({
        references: [{ eventExternalId: 'event-1', iCalUId: 'ical-1' }],
        calendarChannelEventAssociations: [],
        calendarEvents: [
          { id: 'calendar-1', iCalUid: 'ical-1' },
          { id: 'calendar-2', iCalUid: 'ical-1' },
        ],
      }),
    ).toEqual(new Map());
  });

  it('should leave a reference unmatched without an association or a calendar event', () => {
    expect(
      matchTeamsCalendarEventIds({
        references: [
          { eventExternalId: 'event-1', iCalUId: 'ical-1' },
          { eventExternalId: 'series-master-1' },
        ],
        calendarChannelEventAssociations: [],
        calendarEvents: [],
      }),
    ).toEqual(new Map());
  });
});
