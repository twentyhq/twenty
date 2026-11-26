import { type MeetConferenceRecord } from 'src/logic-functions/types/meet-conference-record.type';

export const buildMeetConferenceImportPayload = ({
  connectedAccountId,
  conferenceRecord,
}: {
  connectedAccountId: string;
  conferenceRecord: Pick<
    MeetConferenceRecord,
    'name' | 'startTime' | 'endTime' | 'space'
  >;
}) => ({
  connectedAccountId,
  conferenceRecordName: conferenceRecord.name,
  startTime: conferenceRecord.startTime,
  endTime: conferenceRecord.endTime,
  spaceName: conferenceRecord.space,
});
