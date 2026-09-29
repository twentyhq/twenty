import { describe, expect, it } from 'vitest';

import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { buildRecallRoutingMetadata } from 'src/logic-functions/domain/build-recall-routing-metadata.util';
import { canRescheduleCallRecordingWithoutRecallLookup } from 'src/logic-functions/domain/can-reschedule-call-recording-without-recall-lookup.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { computeRecallBotCreationIdempotencyKey } from 'src/logic-functions/recall-api/schedule-recall-bot.util';

const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = 'workspace-1';
const CALL_RECORDING_ID = 'call-recording-1';
const MEETING_URL = 'https://meet.example.com/customer-sync';
const MEETING_STARTS_AT = '2026-01-01T13:00:00.000Z';

const canRescheduleAttemptMadeMinutesAgo = (minutesAgo: number): boolean => {
  const botScheduleAttemptedAt = new Date(
    NOW.getTime() - minutesAgo * MILLISECONDS_PER_MINUTE,
  ).toISOString();

  return canRescheduleCallRecordingWithoutRecallLookup({
    callRecording: {
      id: CALL_RECORDING_ID,
      botScheduleAttemptedAt,
      botScheduleIdempotencyKey: computeRecallBotCreationIdempotencyKey({
        meetingUrl: MEETING_URL,
        joinAt: computeRecallBotJoinAt(MEETING_STARTS_AT),
        metadata: buildRecallRoutingMetadata({
          callRecordingId: CALL_RECORDING_ID,
          workspaceId: WORKSPACE_ID,
        }),
        attemptedAt: botScheduleAttemptedAt,
      }),
    },
    calendarEvent: {
      id: 'calendar-event-1',
      title: 'Customer sync',
      isCanceled: false,
      startsAt: MEETING_STARTS_AT,
      endsAt: '2026-01-01T14:00:00.000Z',
      iCalUid: undefined,
      conferenceLinkUrl: MEETING_URL,
      callRecorderPreference: undefined,
    },
    workspaceId: WORKSPACE_ID,
    now: NOW,
  });
};

describe('canRescheduleCallRecordingWithoutRecallLookup', () => {
  it('trusts re-sending an unchanged attempt made 44 minutes ago', () => {
    expect(canRescheduleAttemptMadeMinutesAgo(44)).toBe(true);
  });

  it('requires a Recall lookup for an attempt made 46 minutes ago', () => {
    expect(canRescheduleAttemptMadeMinutesAgo(46)).toBe(false);
  });

  it('requires a Recall lookup for an attempt timestamped in the future', () => {
    expect(canRescheduleAttemptMadeMinutesAgo(-5)).toBe(false);
  });
});
