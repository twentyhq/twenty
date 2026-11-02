import { isUndefined } from '@sniptt/guards';
import { describe, expect, it } from 'vitest';
import { type ObjectRecordBaseEvent } from 'twenty-sdk/define';

import { collectCalendarEventIdsFromParticipantEvents } from 'src/logic-functions/domain/collect-calendar-event-ids-from-participant-events.util';
import { type CalendarEventParticipantForDatabaseEvent } from 'src/logic-functions/types/calendar-event-participant-for-database-event.type';

type ParticipantEvent =
  ObjectRecordBaseEvent<CalendarEventParticipantForDatabaseEvent>;

const buildEvent = ({
  before,
  after,
}: {
  before?: Partial<CalendarEventParticipantForDatabaseEvent>;
  after?: Partial<CalendarEventParticipantForDatabaseEvent>;
}): ParticipantEvent =>
  ({
    recordId: 'participant-1',
    properties: {
      before: isUndefined(before)
        ? undefined
        : { id: 'participant-1', ...before },
      after: isUndefined(after) ? undefined : { id: 'participant-1', ...after },
    },
  }) as ParticipantEvent;

describe('collectCalendarEventIdsFromParticipantEvents', () => {
  it('collects the meetings of added, changed and removed attendees, matched or not', () => {
    expect(
      collectCalendarEventIdsFromParticipantEvents([
        buildEvent({
          after: {
            calendarEventId: 'calendar-event-3',
            workspaceMemberId: null,
          },
        }),
        buildEvent({
          before: {
            calendarEventId: 'calendar-event-1',
            workspaceMemberId: null,
          },
          after: {
            calendarEventId: 'calendar-event-1',
            workspaceMemberId: 'member-2',
          },
        }),
        buildEvent({
          before: {
            calendarEventId: 'calendar-event-2',
            workspaceMemberId: 'member-1',
          },
        }),
      ]),
    ).toEqual(['calendar-event-1', 'calendar-event-2', 'calendar-event-3']);
  });

  it('collects both meetings when an attendee moves between them', () => {
    expect(
      collectCalendarEventIdsFromParticipantEvents([
        buildEvent({
          before: { calendarEventId: 'calendar-event-1' },
          after: { calendarEventId: 'calendar-event-2' },
        }),
      ]),
    ).toEqual(['calendar-event-1', 'calendar-event-2']);
  });

  it('ignores events that reference no meeting', () => {
    expect(
      collectCalendarEventIdsFromParticipantEvents([
        buildEvent({ after: { calendarEventId: null } }),
      ]),
    ).toEqual([]);
  });
});
