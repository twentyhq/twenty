import { type GoogleMeetRecording } from 'src/logic-functions/types/google-meet-recording.type';
import { listGoogleMeetCollection } from 'src/logic-functions/utils/list-google-meet-collection.util';

export const listGoogleMeetRecordings = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<GoogleMeetRecording[]> =>
  listGoogleMeetCollection<'recordings', GoogleMeetRecording>({
    accessToken,
    path: `${conferenceRecordName}/recordings`,
    collectionKey: 'recordings',
  });
