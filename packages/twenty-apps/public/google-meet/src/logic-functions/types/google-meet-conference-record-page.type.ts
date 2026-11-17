import { type GoogleMeetConferenceRecord } from 'src/logic-functions/types/google-meet-conference-record.type';

export type GoogleMeetConferenceRecordPage = {
  conferenceRecords?: GoogleMeetConferenceRecord[];
  nextPageToken?: string;
};
