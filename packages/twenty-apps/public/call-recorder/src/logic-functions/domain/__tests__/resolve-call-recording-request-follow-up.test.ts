import { describe, expect, it } from 'vitest';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { resolveCallRecordingRequestFollowUp } from 'src/logic-functions/domain/resolve-call-recording-request-follow-up.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const MINUTES_PER_DAY = 24 * 60;

const minutesFromNow = (minutes: number): string =>
  new Date(NOW.getTime() + minutes * MILLISECONDS_PER_MINUTE).toISOString();

const buildCallRecording = (
  overrides: Partial<CallRecordingRecord> = {},
): CallRecordingRecord => ({
  id: 'call-recording-1',
  status: CallRecordingStatus.SCHEDULED,
  recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
  calendarEventId: 'calendar-event-1',
  ...overrides,
});

const buildCanceledCallRecording = (
  overrides: Partial<CallRecordingRecord> = {},
): CallRecordingRecord =>
  buildCallRecording({
    recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
    updatedAt: minutesFromNow(-30),
    ...overrides,
  });

const buildCalendarEvent = (
  overrides: Partial<CalendarEventRecord> = {},
): CalendarEventRecord => ({
  id: 'calendar-event-1',
  title: 'Customer sync',
  isCanceled: false,
  startsAt: minutesFromNow(60),
  endsAt: minutesFromNow(120),
  iCalUid: undefined,
  conferenceLinkUrl: 'https://meet.example.com/customer-sync',
  callRecorderPreference: undefined,
  ...overrides,
});

const endedCalendarEvent = buildCalendarEvent({
  startsAt: minutesFromNow(-120),
  endsAt: minutesFromNow(-60),
});

describe('resolveCallRecordingRequestFollowUp', () => {
  describe('pending request', () => {
    it('books a bot while the meeting is still ahead', () => {
      const calendarEvent = buildCalendarEvent();

      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording(),
          calendarEvent,
          now: NOW,
        }),
      ).toEqual({ action: 'book-bot', calendarEvent });
    });

    it('waits for the end of the first-try grace when a booking attempt is recent', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording({
            botScheduleAttemptedAt: minutesFromNow(-5),
          }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toEqual({
        action: 'check-again',
        reason: 'a bot booking may still be running',
        checkAt: new Date(minutesFromNow(10)),
      });
    });

    it('books a bot once the last booking attempt is past the first-try grace', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording({
            botScheduleAttemptedAt: minutesFromNow(-20),
          }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toMatchObject({ action: 'book-bot' });
    });

    it('books a bot when the booking attempt is timestamped in the future', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording({
            botScheduleAttemptedAt: minutesFromNow(5),
          }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toMatchObject({ action: 'book-bot' });
    });

    it('leaves a request without a calendar event alone', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording({ calendarEventId: undefined }),
          calendarEvent: undefined,
          now: NOW,
        }),
      ).toMatchObject({ action: 'none' });
    });

    it('fails a request whose meeting ended before any booking attempt', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording(),
          calendarEvent: endedCalendarEvent,
          now: NOW,
        }),
      ).toEqual({
        action: 'mark-failed',
        failureReason: 'bot_never_scheduled',
      });
    });

    it('treats a meeting without an end time as over once it started', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording(),
          calendarEvent: buildCalendarEvent({
            startsAt: minutesFromNow(-1),
            endsAt: undefined,
          }),
          now: NOW,
        }),
      ).toMatchObject({ action: 'mark-failed' });
    });

    it('waits seven days after the meeting for webhooks to settle an attempt that may have reached Recall', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording({
            botScheduleAttemptedAt: minutesFromNow(-180),
          }),
          calendarEvent: endedCalendarEvent,
          now: NOW,
        }),
      ).toEqual({
        action: 'check-again',
        reason:
          'waiting for Recall webhooks to settle the last booking attempt',
        checkAt: new Date(minutesFromNow(7 * MINUTES_PER_DAY - 60)),
      });
    });

    it('fails a request whose unresolved attempt outlived the seven days', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording({
            botScheduleAttemptedAt: minutesFromNow(-9 * MINUTES_PER_DAY),
          }),
          calendarEvent: buildCalendarEvent({
            startsAt: minutesFromNow(-9 * MINUTES_PER_DAY),
            endsAt: minutesFromNow(-8 * MINUTES_PER_DAY),
          }),
          now: NOW,
        }),
      ).toEqual({
        action: 'mark-failed',
        failureReason: 'bot_schedule_outcome_unknown',
      });
    });
  });

  describe('request that does not wait on Recall', () => {
    it('does nothing once the request has its bot', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording({ externalBotId: 'recall-bot-1' }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toMatchObject({ action: 'none' });
    });

    it('does nothing once the bot is recording', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCallRecording({
            status: CallRecordingStatus.RECORDING,
            externalBotId: 'recall-bot-1',
          }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toMatchObject({ action: 'none' });
    });
  });

  describe('canceled request', () => {
    it('cancels the bot that is still booked', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCanceledCallRecording({
            externalBotId: 'recall-bot-1',
          }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toEqual({ action: 'cancel-bot', externalBotId: 'recall-bot-1' });
    });

    it('looks for a bot at Recall when a booking may have reached it without its id being saved', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCanceledCallRecording({
            botScheduleAttemptedAt: minutesFromNow(-40),
          }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toEqual({ action: 'find-and-cancel-bot' });
    });

    it('waits for the end of the first-try grace when the booking attempt is recent', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCanceledCallRecording({
            botScheduleAttemptedAt: minutesFromNow(-1),
          }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toMatchObject({
        action: 'check-again',
        checkAt: new Date(minutesFromNow(14)),
      });
    });

    it('does nothing when no booking ever reached Recall', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCanceledCallRecording(),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toMatchObject({ action: 'none' });
    });

    it('stops chasing the bot once the meeting is over', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCanceledCallRecording({
            externalBotId: 'recall-bot-1',
          }),
          calendarEvent: endedCalendarEvent,
          now: NOW,
        }),
      ).toMatchObject({ action: 'none' });
    });

    it('does nothing for a recording that already finished', () => {
      expect(
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCanceledCallRecording({
            status: CallRecordingStatus.COMPLETED,
            externalBotId: 'recall-bot-1',
          }),
          calendarEvent: buildCalendarEvent(),
          now: NOW,
        }),
      ).toMatchObject({ action: 'none' });
    });

    it('chases the bot for a day after the cancellation when the meeting time is unknown', () => {
      const resolveWithoutMeeting = (canceledMinutesAgo: number) =>
        resolveCallRecordingRequestFollowUp({
          callRecording: buildCanceledCallRecording({
            calendarEventId: undefined,
            externalBotId: 'recall-bot-1',
            updatedAt: minutesFromNow(-canceledMinutesAgo),
          }),
          calendarEvent: undefined,
          now: NOW,
        });

      expect(resolveWithoutMeeting(23 * 60)).toMatchObject({
        action: 'cancel-bot',
      });
      expect(resolveWithoutMeeting(25 * 60)).toMatchObject({ action: 'none' });
    });
  });
});
