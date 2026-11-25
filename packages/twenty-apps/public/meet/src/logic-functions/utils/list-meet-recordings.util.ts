import { type MeetRecording } from 'src/logic-functions/types/meet-recording.type';
import { listMeetCollection } from 'src/logic-functions/utils/list-meet-collection.util';

export const listMeetRecordings = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<MeetRecording[]> =>
  listMeetCollection<'recordings', MeetRecording>({
    accessToken,
    path: `${conferenceRecordName}/recordings`,
    collectionKey: 'recordings',
  });
