import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { type RecallBotMetadata } from 'src/logic-functions/types/recall-bot-metadata.type';
import { computeRealMeetingKey } from 'src/logic-functions/domain/compute-real-meeting-key.util';

export const buildRecallBotMetadata = ({
  callRecording,
  calendarEvent,
  workspaceId,
}: MeetingRecording & { workspaceId: string }): RecallBotMetadata => {
  return {
    twentyWorkspaceId: workspaceId,
    twentyCallRecordingId: callRecording.id,
    twentyCalendarEventId: calendarEvent.id,
    twentyRealMeetingKey: computeRealMeetingKey({
      calendarEventId: calendarEvent.id,
      conferenceLinkUrl: calendarEvent.conferenceLinkUrl,
      iCalUid: calendarEvent.iCalUid,
      startsAt: calendarEvent.startsAt,
    }),
  };
};
