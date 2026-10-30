import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFERRED_RECALL_BOT_DELETION_MAX_LEAD_MINUTES } from 'src/logic-functions/constants/deferred-recall-bot-deletion-max-lead-minutes';
import { DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES } from 'src/logic-functions/constants/deferred-recall-bot-deletion-min-lead-minutes';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { computeDeferredRecallBotDeletionAt } from 'src/logic-functions/domain/compute-deferred-recall-bot-deletion-at.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const MEETING_STARTS_AT = '2026-01-02T09:00:00.000Z';
const RECALL_BOT_JOIN_TIME = new Date('2026-01-02T08:59:00.000Z').getTime();

const buildCalendarEvent = (
  overrides: Partial<CalendarEventRecord> = {},
): CalendarEventRecord => ({
  id: 'calendar-event-1',
  title: 'Customer sync',
  isCanceled: false,
  startsAt: MEETING_STARTS_AT,
  endsAt: '2026-01-02T10:00:00.000Z',
  iCalUid: undefined,
  conferenceLinkUrl: 'https://meet.example.com/customer-sync',
  callRecorderPreference: undefined,
  ...overrides,
});

const buildCallRecordingIdForStart = (startsAt: string): string =>
  computeCallRecordingIdForMeeting(
    `link:meet.example.com/customer-sync:${startsAt}`,
  );

const CALL_RECORDING_ID = buildCallRecordingIdForStart(MEETING_STARTS_AT);

describe('computeDeferredRecallBotDeletionAt', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns the same deletion time for the same recording', () => {
    const compute = () =>
      computeDeferredRecallBotDeletionAt({
        callRecordingId: CALL_RECORDING_ID,
        calendarEvent: buildCalendarEvent(),
        now: NOW,
      });

    expect(compute()).toEqual(compute());
  });

  it('places the deletion inside the window before the bot joins', () => {
    const deletionTime = computeDeferredRecallBotDeletionAt({
      callRecordingId: CALL_RECORDING_ID,
      calendarEvent: buildCalendarEvent(),
      now: NOW,
    })?.getTime();

    expect(deletionTime).toBeGreaterThan(
      RECALL_BOT_JOIN_TIME -
        DEFERRED_RECALL_BOT_DELETION_MAX_LEAD_MINUTES * MILLISECONDS_PER_MINUTE,
    );
    expect(deletionTime).toBeLessThanOrEqual(
      RECALL_BOT_JOIN_TIME -
        DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES * MILLISECONDS_PER_MINUTE,
    );
  });

  it('spreads the deletions of different recordings across the window', () => {
    const otherMeetingCalendarEvent = buildCalendarEvent({
      conferenceLinkUrl: 'https://meet.example.com/other-sync',
    });

    expect(
      computeDeferredRecallBotDeletionAt({
        callRecordingId: CALL_RECORDING_ID,
        calendarEvent: buildCalendarEvent(),
        now: NOW,
      }),
    ).not.toEqual(
      computeDeferredRecallBotDeletionAt({
        callRecordingId: computeCallRecordingIdForMeeting(
          `link:meet.example.com/other-sync:${MEETING_STARTS_AT}`,
        ),
        calendarEvent: otherMeetingCalendarEvent,
        now: NOW,
      }),
    );
  });

  it('follows the join-early setting', () => {
    const deletionTimeWithDefaultJoin = computeDeferredRecallBotDeletionAt({
      callRecordingId: CALL_RECORDING_ID,
      calendarEvent: buildCalendarEvent(),
      now: NOW,
    })?.getTime();

    vi.stubEnv('CALL_RECORDER_JOIN_EARLY_MINUTES', '11');

    expect(
      computeDeferredRecallBotDeletionAt({
        callRecordingId: CALL_RECORDING_ID,
        calendarEvent: buildCalendarEvent(),
        now: NOW,
      })?.getTime(),
    ).toBe((deletionTimeWithDefaultJoin ?? 0) - 10 * MILLISECONDS_PER_MINUTE);
  });

  it('asks for an immediate deletion once the deletion time has passed', () => {
    expect(
      computeDeferredRecallBotDeletionAt({
        callRecordingId: CALL_RECORDING_ID,
        calendarEvent: buildCalendarEvent(),
        now: new Date(
          RECALL_BOT_JOIN_TIME -
            DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES *
              MILLISECONDS_PER_MINUTE,
        ),
      }),
    ).toBeUndefined();
  });

  it('asks for an immediate deletion when the meeting start is unknown', () => {
    expect(
      computeDeferredRecallBotDeletionAt({
        callRecordingId: CALL_RECORDING_ID,
        calendarEvent: undefined,
        now: NOW,
      }),
    ).toBeUndefined();
    expect(
      computeDeferredRecallBotDeletionAt({
        callRecordingId: CALL_RECORDING_ID,
        calendarEvent: buildCalendarEvent({ startsAt: undefined }),
        now: NOW,
      }),
    ).toBeUndefined();
  });

  it('asks for an immediate deletion once the event moved away from the time the bot was booked for', () => {
    expect(
      computeDeferredRecallBotDeletionAt({
        callRecordingId: buildCallRecordingIdForStart(
          '2026-01-01T13:00:00.000Z',
        ),
        calendarEvent: buildCalendarEvent(),
        now: NOW,
      }),
    ).toBeUndefined();
  });
});
