import { type GoogleMeetTranscript } from 'src/logic-functions/types/google-meet-transcript.type';
import { listGoogleMeetCollection } from 'src/logic-functions/utils/list-google-meet-collection.util';

export const listGoogleMeetTranscripts = ({
  accessToken,
  conferenceRecordName,
}: {
  accessToken: string;
  conferenceRecordName: string;
}): Promise<GoogleMeetTranscript[]> =>
  listGoogleMeetCollection<'transcripts', GoogleMeetTranscript>({
    accessToken,
    path: `${conferenceRecordName}/transcripts`,
    collectionKey: 'transcripts',
  });
