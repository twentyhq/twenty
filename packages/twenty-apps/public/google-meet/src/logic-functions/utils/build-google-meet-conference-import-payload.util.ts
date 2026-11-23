import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';

export const buildGoogleMeetConferenceImportPayload = ({
  connectedAccountId,
  conferenceRecord,
}: {
  connectedAccountId: string;
  conferenceRecord: Pick<
    GoogleMeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
}) => ({
  connectedAccountId,
  conferenceRecordName: conferenceRecord.name,
  startTime: conferenceRecord.startTime,
  endTime: conferenceRecord.endTime,
  spaceName: conferenceRecord.space,
});
