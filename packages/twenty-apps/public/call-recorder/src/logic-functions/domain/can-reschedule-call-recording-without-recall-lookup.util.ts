import { isUndefined } from '@sniptt/guards';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { hasUnchangedBotScheduleIdempotencyKey } from 'src/logic-functions/domain/has-unchanged-bot-schedule-idempotency-key.util';

// Recall retains idempotency keys for one hour. Keep a small safety margin so
// queue and clock skew cannot turn a recovery resend into a twin bot.
const IDEMPOTENT_RESEND_WINDOW_MINUTES = 55;

// A row with no attempt state never reached Recall. A complete, recent attempt
// can safely re-send the same creation. Partial state is legacy or corrupt and
// must be reconciled through Recall before another attempt can be claimed.
export const canRescheduleCallRecordingWithoutRecallLookup = ({
  callRecording,
  calendarEvent,
  workspaceId,
  now,
}: {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  workspaceId: string | undefined;
  now: Date;
}): boolean => {
  const hasNoBotScheduleAttemptState =
    isUndefined(callRecording.botScheduleAttemptId) &&
    isUndefined(callRecording.botScheduleAttemptedAt) &&
    isUndefined(callRecording.botScheduleIdempotencyKey);

  if (hasNoBotScheduleAttemptState) {
    return true;
  }

  return (
    !isUndefined(callRecording.botScheduleAttemptId) &&
    !isUndefined(callRecording.botScheduleAttemptedAt) &&
    isWithinIdempotentResendWindow(
      callRecording.botScheduleAttemptedAt,
      now,
    ) &&
    !isUndefined(workspaceId) &&
    hasUnchangedBotScheduleIdempotencyKey({
      callRecording,
      calendarEvent,
      workspaceId,
    })
  );
};

const isWithinIdempotentResendWindow = (
  botScheduleAttemptedAt: string,
  now: Date,
): boolean => {
  const attemptedTime = new Date(botScheduleAttemptedAt).getTime();

  if (Number.isNaN(attemptedTime)) {
    return false;
  }

  const elapsedMilliseconds = now.getTime() - attemptedTime;

  // A future timestamp means clock skew or corrupt data; treat it as
  // untrustworthy rather than fresh.
  return (
    elapsedMilliseconds >= 0 &&
    elapsedMilliseconds < IDEMPOTENT_RESEND_WINDOW_MINUTES * 60 * 1000
  );
};
