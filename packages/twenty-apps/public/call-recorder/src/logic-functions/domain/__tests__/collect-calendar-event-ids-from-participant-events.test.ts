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
      before:
        before === undefined ? undefined : { id: 'participant-1', ...before },
      after:
        after === undefined ? undefined : { id: 'participant-1', ...after },
    },
  }) as ParticipantEvent;

describe('collectCalendarEventIdsFromParticipantEvents', () => {
  it('ignores attendees that match no workspace member', () => {
    expect(
      collectCalendarEventIdsFromParticipantEvents([
        buildEvent({
          after: {
            calendarEventId: 'calendar-event-1',
            workspaceMemberId: null,
          },
        }),
        buildEvent({
          before: { calendarEventId: 'calendar-event-2' },
        }),
      ]),
    ).toEqual([]);
  });

  it('collects the event of a matched attendee that was added, matched or removed', () => {
    expect(
      collectCalendarEventIdsFromParticipantEvents([
        buildEvent({
          after: {
            calendarEventId: 'calendar-event-3',
            workspaceMemberId: 'member-1',
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

  it('collects both events when a matched attendee moves between meetings', () => {
    expect(
      collectCalendarEventIdsFromParticipantEvents([
        buildEvent({
          before: {
            calendarEventId: 'calendar-event-1',
            workspaceMemberId: 'member-1',
          },
          after: {
            calendarEventId: 'calendar-event-2',
            workspaceMemberId: 'member-1',
          },
        }),
      ]),
    ).toEqual(['calendar-event-1', 'calendar-event-2']);
  });
});
