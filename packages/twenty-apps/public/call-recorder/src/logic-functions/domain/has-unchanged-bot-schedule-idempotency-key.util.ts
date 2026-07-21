import { isUndefined } from '@sniptt/guards';

import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { buildRecallRoutingMetadata } from 'src/logic-functions/domain/build-recall-routing-metadata.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';
import { computeRecallBotCreationIdempotencyKey } from 'src/logic-functions/recall-api/schedule-recall-bot.util';

// True when re-sending the bot creation would carry the same idempotency key
// as the recorded attempt, so Recall dedupes it instead of creating a twin.
// A moved meeting, changed conference link, or changed join-early setting
// drifts the key and recovery must fall back to a bot lookup.
export const hasUnchangedBotScheduleIdempotencyKey = ({
  callRecording,
  calendarEvent,
  workspaceId,
}: {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  workspaceId: string;
}): boolean => {
  const storedIdempotencyKey = callRecording.botScheduleIdempotencyKey;
  const meetingUrl = calendarEvent.conferenceLinkUrl;
  const meetingStartsAt = calendarEvent.startsAt;

  if (
    isUndefined(storedIdempotencyKey) ||
    isUndefined(meetingUrl) ||
    isUndefined(meetingStartsAt)
  ) {
    return false;
  }

  return (
    storedIdempotencyKey ===
    computeRecallBotCreationIdempotencyKey({
      meetingUrl,
      joinAt: computeRecallBotJoinAt(meetingStartsAt),
      metadata: buildRecallRoutingMetadata({
        callRecordingId: callRecording.id,
        workspaceId,
      }),
    })
  );
};
