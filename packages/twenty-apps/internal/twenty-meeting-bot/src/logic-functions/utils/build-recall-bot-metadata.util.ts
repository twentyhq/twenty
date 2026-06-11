import { APPLICATION_ID_ENV_VAR_NAME } from 'src/logic-functions/constants/application-id-env-var-name';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { type RecallBotMetadata } from 'src/logic-functions/types/recall-bot-metadata.type';
import { computeRealMeetingKey } from 'src/logic-functions/utils/compute-real-meeting-key.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';

export const buildRecallBotMetadata = ({
  callRecording,
  calendarEvent,
}: MeetingRecording): RecallBotMetadata => {
  const applicationId = getApplicationVariableValue(
    APPLICATION_ID_ENV_VAR_NAME,
  );

  return {
    twentyCallRecordingId: callRecording.id,
    twentyCalendarEventId: calendarEvent.id,
    twentyRealMeetingKey: computeRealMeetingKey({
      calendarEventId: calendarEvent.id,
      conferenceLinkUrl: calendarEvent.conferenceLink?.primaryLinkUrl ?? null,
      iCalUid: calendarEvent.iCalUid,
      startsAt: calendarEvent.startsAt,
    }),
    ...(applicationId === undefined
      ? {}
      : { twentyApplicationId: applicationId }),
  };
};
