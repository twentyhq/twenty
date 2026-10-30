import { isUndefined } from '@sniptt/guards';
import { createHash } from 'crypto';

import { DEFERRED_RECALL_BOT_DELETION_MAX_LEAD_MINUTES } from 'src/logic-functions/constants/deferred-recall-bot-deletion-max-lead-minutes';
import { DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES } from 'src/logic-functions/constants/deferred-recall-bot-deletion-min-lead-minutes';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';
import { computeRecallBotJoinAt } from 'src/logic-functions/domain/compute-recall-bot-join-at.util';

type DeferredDeletionCalendarEvent = Pick<
  CalendarEventRecord,
  'id' | 'conferenceLinkUrl' | 'iCalUid' | 'startsAt'
>;

// Undefined means delete now: the join time is unknown or the deletion time has passed.
export const computeDeferredRecallBotDeletionAt = ({
  callRecordingId,
  calendarEvent,
  now,
}: {
  callRecordingId: string;
  calendarEvent: DeferredDeletionCalendarEvent | undefined;
  now: Date;
}): Date | undefined => {
  const meetingStartsAt = calendarEvent?.startsAt;

  if (
    isUndefined(calendarEvent) ||
    isUndefined(meetingStartsAt) ||
    !isMeetingOfCallRecording({ calendarEvent, callRecordingId })
  ) {
    return undefined;
  }

  const joinTime = new Date(computeRecallBotJoinAt(meetingStartsAt)).getTime();

  if (Number.isNaN(joinTime)) {
    return undefined;
  }

  const deletionTime = joinTime - computeDeletionLeadMs(callRecordingId);

  return deletionTime > now.getTime() ? new Date(deletionTime) : undefined;
};

// A moved or relinked event no longer tells when the bot, booked for the old key, joins.
const isMeetingOfCallRecording = ({
  calendarEvent,
  callRecordingId,
}: {
  calendarEvent: DeferredDeletionCalendarEvent;
  callRecordingId: string;
}): boolean =>
  computeCallRecordingIdForMeeting(
    computeRealMeetingKey({
      calendarEventId: calendarEvent.id,
      conferenceLinkUrl: calendarEvent.conferenceLinkUrl,
      iCalUid: calendarEvent.iCalUid,
      startsAt: calendarEvent.startsAt,
    }),
  ) === callRecordingId;

// Stable per recording so repeated follow-ups share a due time, yet spread across the window.
const computeDeletionLeadMs = (callRecordingId: string): number =>
  DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES * MILLISECONDS_PER_MINUTE +
  (createHash('sha256').update(callRecordingId).digest().readUInt32BE(0) %
    ((DEFERRED_RECALL_BOT_DELETION_MAX_LEAD_MINUTES -
      DEFERRED_RECALL_BOT_DELETION_MIN_LEAD_MINUTES) *
      MILLISECONDS_PER_MINUTE));
