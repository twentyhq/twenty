import { describe, expect, it } from 'vitest';

import { type CalendarEventForDatabaseEvent } from 'src/logic-functions/types/calendar-event-for-database-event.type';
import { buildCalendarEventReconciliationPayload } from 'src/logic-functions/domain/build-calendar-event-reconciliation-payload.util';

const PREVIOUS_STARTS_AT = '2026-01-01T13:00:00.000Z';
const NEXT_STARTS_AT = '2026-01-01T15:00:00.000Z';

const buildCalendarEvent = (
  overrides: Partial<CalendarEventForDatabaseEvent> = {},
): CalendarEventForDatabaseEvent => ({
  id: 'calendar-event-1',
  callRecorderPreference: null,
  conferenceLink: { primaryLinkUrl: 'https://meet.google.com/customer-sync' },
  location: null,
  description: null,
  iCalUid: 'calendar-event-uid',
  startsAt: PREVIOUS_STARTS_AT,
  ...overrides,
});

const buildEvent = ({
  updatedFields,
  before = buildCalendarEvent(),
  after = buildCalendarEvent(),
}: {
  updatedFields?: string[];
  before?: CalendarEventForDatabaseEvent;
  after?: CalendarEventForDatabaseEvent;
} = {}) => ({
  recordId: after.id,
  properties: { updatedFields, before, after },
});

const PREVIOUS_OCCURRENCE = {
  calendarEventId: 'calendar-event-1',
  realMeetingKey: `link:meet.google.com/customer-sync:${PREVIOUS_STARTS_AT}`,
  startsAt: PREVIOUS_STARTS_AT,
};

describe('buildCalendarEventReconciliationPayload', () => {
  it('reconciles created calendar events', () => {
    expect(
      buildCalendarEventReconciliationPayload({
        action: 'created',
        events: [
          buildEvent({ after: buildCalendarEvent({ id: 'calendar-event-2' }) }),
          buildEvent(),
        ],
      }),
    ).toEqual({
      calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      echoCandidateCalendarEventIds: [],
      removedOccurrences: [],
    });
  });

  it('reconciles an update that keeps the meeting key without removing an occurrence', () => {
    expect(
      buildCalendarEventReconciliationPayload({
        action: 'updated',
        events: [buildEvent({ updatedFields: ['title', 'endsAt'] })],
      }),
    ).toEqual({
      calendarEventIds: ['calendar-event-1'],
      echoCandidateCalendarEventIds: [],
      removedOccurrences: [],
    });
  });

  it('removes the previous occurrence when an update changes a key field', () => {
    expect(
      buildCalendarEventReconciliationPayload({
        action: 'updated',
        events: [
          buildEvent({
            updatedFields: ['startsAt'],
            after: buildCalendarEvent({ startsAt: NEXT_STARTS_AT }),
          }),
        ],
      }),
    ).toEqual({
      calendarEventIds: ['calendar-event-1'],
      echoCandidateCalendarEventIds: [],
      removedOccurrences: [PREVIOUS_OCCURRENCE],
    });
  });

  it.each(['deleted', 'destroyed'])(
    'removes the occurrence of a %s calendar event',
    (action) => {
      expect(
        buildCalendarEventReconciliationPayload({
          action,
          events: [buildEvent()],
        }),
      ).toEqual({
        calendarEventIds: [],
        echoCandidateCalendarEventIds: [],
        removedOccurrences: [PREVIOUS_OCCURRENCE],
      });
    },
  );

  it.each([
    ['blank', 'On', null, 'ON'],
    ['On', 'blank', 'ON', null],
  ])(
    'treats a preference change from %s to %s as an echo candidate',
    (_beforeLabel, _afterLabel, beforePreference, afterPreference) => {
      expect(
        buildCalendarEventReconciliationPayload({
          action: 'updated',
          events: [
            buildEvent({
              updatedFields: ['callRecorderPreference'],
              before: buildCalendarEvent({
                callRecorderPreference: beforePreference,
              }),
              after: buildCalendarEvent({
                callRecorderPreference: afterPreference,
              }),
            }),
          ],
        }),
      ).toEqual({
        calendarEventIds: [],
        echoCandidateCalendarEventIds: ['calendar-event-1'],
        removedOccurrences: [],
      });
    },
  );

  it.each([
    ['blank', 'Off', null, 'OFF'],
    ['Off', 'blank', 'OFF', null],
    ['On', 'Off', 'ON', 'OFF'],
  ])(
    'reconciles a preference change from %s to %s',
    (_beforeLabel, _afterLabel, beforePreference, afterPreference) => {
      expect(
        buildCalendarEventReconciliationPayload({
          action: 'updated',
          events: [
            buildEvent({
              updatedFields: ['callRecorderPreference'],
              before: buildCalendarEvent({
                callRecorderPreference: beforePreference,
              }),
              after: buildCalendarEvent({
                callRecorderPreference: afterPreference,
              }),
            }),
          ],
        }),
      ).toEqual({
        calendarEventIds: ['calendar-event-1'],
        echoCandidateCalendarEventIds: [],
        removedOccurrences: [],
      });
    },
  );

  it('reconciles a preference change that comes with another field change', () => {
    expect(
      buildCalendarEventReconciliationPayload({
        action: 'updated',
        events: [
          buildEvent({
            updatedFields: ['callRecorderPreference', 'title'],
            after: buildCalendarEvent({ callRecorderPreference: 'ON' }),
          }),
        ],
      }),
    ).toEqual({
      calendarEventIds: ['calendar-event-1'],
      echoCandidateCalendarEventIds: [],
      removedOccurrences: [],
    });
  });

  it('dedupes calendar event ids across the batch', () => {
    expect(
      buildCalendarEventReconciliationPayload({
        action: 'updated',
        events: [
          buildEvent({ updatedFields: ['title'] }),
          buildEvent({ updatedFields: ['endsAt'] }),
        ],
      }),
    ).toEqual({
      calendarEventIds: ['calendar-event-1'],
      echoCandidateCalendarEventIds: [],
      removedOccurrences: [],
    });
  });

  it.each([
    ['an empty batch', 'updated', []],
    ['an action it does not reconcile', 'restored', [buildEvent()]],
  ])('returns nothing to reconcile for %s', (_label, action, events) => {
    expect(buildCalendarEventReconciliationPayload({ action, events })).toEqual(
      {
        calendarEventIds: [],
        echoCandidateCalendarEventIds: [],
        removedOccurrences: [],
      },
    );
  });
});
