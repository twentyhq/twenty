import { isString, isUndefined } from '@sniptt/guards';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';

const BOT_NEVER_SCHEDULED_FAILURE_REASON = 'bot_never_scheduled';
const BOT_SCHEDULE_OUTCOME_UNKNOWN_FAILURE_REASON =
  'bot_schedule_outcome_unknown';

// A booking attempt this recent may still be running; acting now would race it.
const FIRST_TRY_GRACE_MS = 15 * MILLISECONDS_PER_MINUTE;

// Mirrors the stale-state convergence lookback: past it no automatic pull
// pass will resolve the row anymore, so keeping it pending only wastes runs.
const UNRESOLVED_ATTEMPT_MAX_AGE_MS = 7 * 24 * 60 * MILLISECONDS_PER_MINUTE;

// A canceled request's bot is chased until its meeting is over, or for a day
// when the meeting time is unknown; past that, the daily orphaned bot cleanup
// owns any bot left behind.
const CANCELED_BOT_FOLLOW_UP_HOURS = 24;

export type CallRecordingRequestFollowUp =
  | { action: 'none'; reason: string }
  | { action: 'check-again'; reason: string; checkAt: Date }
  | { action: 'book-bot'; calendarEvent: CalendarEventRecord }
  | { action: 'mark-failed'; failureReason: string }
  | { action: 'cancel-bot'; externalBotId: string }
  | { action: 'find-and-cancel-bot' };

export const resolveCallRecordingRequestFollowUp = ({
  callRecording,
  calendarEvent,
  now,
}: {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord | undefined;
  now: Date;
}): CallRecordingRequestFollowUp => {
  if (
    callRecording.recordingRequestStatus === CallRecordingRequestStatus.CANCELED
  ) {
    return resolveCanceledRequestFollowUp({
      callRecording,
      calendarEvent,
      now,
    });
  }

  if (
    callRecording.recordingRequestStatus ===
      CallRecordingRequestStatus.REQUESTED &&
    callRecording.status === CallRecordingStatus.SCHEDULED &&
    isUndefined(callRecording.externalBotId)
  ) {
    return resolvePendingRequestFollowUp({ callRecording, calendarEvent, now });
  }

  return { action: 'none', reason: 'request is not waiting on Recall' };
};

const resolvePendingRequestFollowUp = ({
  callRecording,
  calendarEvent,
  now,
}: {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord | undefined;
  now: Date;
}): CallRecordingRequestFollowUp => {
  if (isUndefined(calendarEvent)) {
    return { action: 'none', reason: 'no calendar event to book a bot for' };
  }

  const meetingEndTime = getMeetingEndTime(calendarEvent);

  if (isUndefined(meetingEndTime) || meetingEndTime > now.getTime()) {
    const firstTryGraceEnd = getFirstTryGraceEnd({
      botScheduleAttemptedAt: callRecording.botScheduleAttemptedAt,
      now,
    });

    if (!isUndefined(firstTryGraceEnd)) {
      return {
        action: 'check-again',
        reason: 'a bot booking may still be running',
        checkAt: firstTryGraceEnd,
      };
    }

    return { action: 'book-bot', calendarEvent };
  }

  // Only an absent attempt marker proves no POST reached Recall; a marked row
  // may have a bot that joined and recorded before the id write-back was lost,
  // so it keeps its recovery chance until the convergence lookback has passed.
  if (isUndefined(callRecording.botScheduleAttemptedAt)) {
    return {
      action: 'mark-failed',
      failureReason: BOT_NEVER_SCHEDULED_FAILURE_REASON,
    };
  }

  const convergenceDeadline = meetingEndTime + UNRESOLVED_ATTEMPT_MAX_AGE_MS;

  if (convergenceDeadline <= now.getTime()) {
    return {
      action: 'mark-failed',
      failureReason: BOT_SCHEDULE_OUTCOME_UNKNOWN_FAILURE_REASON,
    };
  }

  return {
    action: 'check-again',
    reason: 'waiting for Recall webhooks to settle the last booking attempt',
    checkAt: new Date(convergenceDeadline),
  };
};

const resolveCanceledRequestFollowUp = ({
  callRecording,
  calendarEvent,
  now,
}: {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord | undefined;
  now: Date;
}): CallRecordingRequestFollowUp => {
  if (
    !isNonTerminalCallRecordingStatus(callRecording.status) ||
    !canCanceledRequestBotStillJoin({ callRecording, calendarEvent, now })
  ) {
    return { action: 'none', reason: 'no bot left to stop' };
  }

  if (!isUndefined(callRecording.externalBotId)) {
    return { action: 'cancel-bot', externalBotId: callRecording.externalBotId };
  }

  // Without an attempt marker no booking ever reached Recall.
  if (isUndefined(callRecording.botScheduleAttemptedAt)) {
    return { action: 'none', reason: 'request never reached Recall' };
  }

  const firstTryGraceEnd = getFirstTryGraceEnd({
    botScheduleAttemptedAt: callRecording.botScheduleAttemptedAt,
    now,
  });

  if (!isUndefined(firstTryGraceEnd)) {
    return {
      action: 'check-again',
      reason: 'a bot booking may still be running',
      checkAt: firstTryGraceEnd,
    };
  }

  return { action: 'find-and-cancel-bot' };
};

// Mirrors hasMeetingEnded: an unparseable end time falls back to the start time.
const getMeetingEndTime = (
  calendarEvent: CalendarEventRecord,
): number | undefined => {
  return [calendarEvent.endsAt, calendarEvent.startsAt]
    .filter(isString)
    .map((candidate) => new Date(candidate).getTime())
    .find((candidateTime) => !Number.isNaN(candidateTime));
};

const getFirstTryGraceEnd = ({
  botScheduleAttemptedAt,
  now,
}: {
  botScheduleAttemptedAt: string | undefined;
  now: Date;
}): Date | undefined => {
  if (isUndefined(botScheduleAttemptedAt)) {
    return undefined;
  }

  const attemptedTime = new Date(botScheduleAttemptedAt).getTime();
  const elapsedMilliseconds = now.getTime() - attemptedTime;

  // A future timestamp means clock skew or corrupt data, not a running attempt.
  if (
    Number.isNaN(attemptedTime) ||
    elapsedMilliseconds < 0 ||
    elapsedMilliseconds >= FIRST_TRY_GRACE_MS
  ) {
    return undefined;
  }

  return new Date(attemptedTime + FIRST_TRY_GRACE_MS);
};

const canCanceledRequestBotStillJoin = ({
  callRecording,
  calendarEvent,
  now,
}: {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord | undefined;
  now: Date;
}): boolean => {
  const meetingStartsAt = calendarEvent?.startsAt;

  if (!isUndefined(meetingStartsAt)) {
    return !hasMeetingEnded({
      startsAt: meetingStartsAt,
      endsAt: calendarEvent?.endsAt,
      now,
      startGraceHours: CANCELED_BOT_FOLLOW_UP_HOURS,
    });
  }

  // Without a meeting time (its calendar event was deleted), the cancellation
  // bounds the chase; updatedAt tracks the cancellation write.
  const canceledAt = callRecording.updatedAt ?? callRecording.createdAt;

  if (isUndefined(canceledAt)) {
    return false;
  }

  return (
    new Date(canceledAt).getTime() +
      CANCELED_BOT_FOLLOW_UP_HOURS * 60 * MILLISECONDS_PER_MINUTE >
    now.getTime()
  );
};

const isNonTerminalCallRecordingStatus = (
  status: string | undefined,
): boolean => {
  return NON_TERMINAL_CALL_RECORDING_STATUSES.some(
    (nonTerminalStatus) => nonTerminalStatus === status,
  );
};
