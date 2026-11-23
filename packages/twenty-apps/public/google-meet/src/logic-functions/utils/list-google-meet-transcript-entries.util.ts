import { type GoogleMeetTranscriptEntry } from 'src/logic-functions/types/google-meet-transcript-entry.type';
import { listGoogleMeetCollection } from 'src/logic-functions/utils/list-google-meet-collection.util';

export const listGoogleMeetTranscriptEntries = ({
  accessToken,
  transcriptName,
}: {
  accessToken: string;
  transcriptName: string;
}): Promise<GoogleMeetTranscriptEntry[]> =>
  listGoogleMeetCollection<'transcriptEntries', GoogleMeetTranscriptEntry>({
    accessToken,
    path: `${transcriptName}/entries`,
    collectionKey: 'transcriptEntries',
  });
