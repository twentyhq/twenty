import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { markUnclaimedCallRecordingFailed } from 'src/logic-functions/data/mark-unclaimed-call-recording-failed.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

const BOT_NEVER_SCHEDULED_FAILURE_REASON = 'bot_never_scheduled';
const BOT_SCHEDULE_OUTCOME_UNKNOWN_FAILURE_REASON =
  'bot_schedule_outcome_unknown';

const UNRESOLVED_ATTEMPT_MAX_AGE_DAYS = 7;

export const resolveEndedPendingCallRecording = async ({
  client,
  callRecording,
  calendarEvent,
  now,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  now: Date;
}): Promise<boolean> => {
  if (isUndefined(callRecording.botScheduleAttemptedAt)) {
    return markCallRecordingFailed({
      client,
      callRecording,
      failureReason: BOT_NEVER_SCHEDULED_FAILURE_REASON,
      logMessage: `call recording ${callRecording.id} never got a Recall bot and its meeting has ended; marking it failed`,
    });
  }

  if (!hasUnresolvedAttemptAgedOut({ calendarEvent, now })) {
    console.warn(
      `[call-recorder] call recording ${callRecording.id} has an unresolved Recall bot creation attempt and its meeting has ended; waiting for convergence`,
    );

    return false;
  }

  return markCallRecordingFailed({
    client,
    callRecording,
    failureReason: BOT_SCHEDULE_OUTCOME_UNKNOWN_FAILURE_REASON,
    logMessage: `call recording ${callRecording.id} has an unresolved Recall bot creation attempt older than the convergence lookback; marking it failed`,
  });
};

const hasUnresolvedAttemptAgedOut = ({
  calendarEvent,
  now,
}: {
  calendarEvent: CalendarEventRecord;
  now: Date;
}): boolean => {
  const meetingEndTime = [calendarEvent.endsAt, calendarEvent.startsAt]
    .filter((candidate) => !isUndefined(candidate))
    .map((candidate) => new Date(candidate).getTime())
    .find((candidateTime) => !Number.isNaN(candidateTime));

  return (
    !isUndefined(meetingEndTime) &&
    meetingEndTime + UNRESOLVED_ATTEMPT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000 <=
      now.getTime()
  );
};

const markCallRecordingFailed = async ({
  client,
  callRecording,
  failureReason,
  logMessage,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  failureReason: string;
  logMessage: string;
}): Promise<boolean> => {
  const didMarkCallRecordingFailed = await markUnclaimedCallRecordingFailed(
    client,
    {
      callRecordingId: callRecording.id,
      expectedBotScheduleAttemptedAt: callRecording.botScheduleAttemptedAt,
      expectedBotScheduleIdempotencyKey:
        callRecording.botScheduleIdempotencyKey,
      failureReason,
    },
  );

  if (didMarkCallRecordingFailed) {
    console.warn(`[call-recorder] ${logMessage}`);
  }

  return didMarkCallRecordingFailed;
};
