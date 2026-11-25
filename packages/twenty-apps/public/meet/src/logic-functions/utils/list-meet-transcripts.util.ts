import { type MeetTranscript } from 'src/logic-functions/types/meet-transcript.type';
import { listMeetCollection } from 'src/logic-functions/utils/list-meet-collection.util';

export const listMeetTranscripts = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<MeetTranscript[]> =>
  listMeetCollection<'transcripts', MeetTranscript>({
    accessToken,
    path: `${conferenceRecordName}/transcripts`,
    collectionKey: 'transcripts',
  });
