import { isUndefined } from '@sniptt/guards';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { hasUnchangedBotScheduleIdempotencyKey } from 'src/logic-functions/domain/has-unchanged-bot-schedule-idempotency-key.util';

// Rows without a schedule-attempt marker never reached Recall, so no bot can
// exist for them. Rows whose stored idempotency key still matches the current
// scheduling inputs can re-send the creation and let Recall dedupe it.
export const canRescheduleCallRecordingWithoutRecallLookup = ({
  callRecording,
  calendarEvent,
  workspaceId,
}: {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  workspaceId: string | undefined;
}): boolean =>
  isUndefined(callRecording.botScheduleAttemptedAt) ||
  (!isUndefined(workspaceId) &&
    hasUnchangedBotScheduleIdempotencyKey({
      callRecording,
      calendarEvent,
      workspaceId,
    }));
