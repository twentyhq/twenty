import { isUndefined } from '@sniptt/guards';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { hasUnchangedBotScheduleIdempotencyKey } from 'src/logic-functions/domain/has-unchanged-bot-schedule-idempotency-key.util';

// Recall does not document how long idempotency keys are retained (24h is
// the industry minimum), so re-sends are only trusted while the recorded
// attempt is clearly fresh; a stale key would create a twin bot instead of
// deduping. Recovery normally runs within minutes of the attempt.
const IDEMPOTENT_RESEND_WINDOW_HOURS = 12;

// Rows without a schedule-attempt marker never reached Recall, so no bot can
// exist for them. Rows whose stored idempotency key still matches the current
// scheduling inputs can re-send the creation and let Recall dedupe it.
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
}): boolean =>
  isUndefined(callRecording.botScheduleAttemptedAt) ||
  (isWithinIdempotentResendWindow(callRecording.botScheduleAttemptedAt, now) &&
    !isUndefined(workspaceId) &&
    hasUnchangedBotScheduleIdempotencyKey({
      callRecording,
      calendarEvent,
      workspaceId,
    }));

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
    elapsedMilliseconds < IDEMPOTENT_RESEND_WINDOW_HOURS * 60 * 60 * 1000
  );
};
