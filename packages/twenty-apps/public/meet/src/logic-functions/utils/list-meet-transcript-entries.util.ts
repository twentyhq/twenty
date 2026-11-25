import { type MeetTranscriptEntry } from 'src/logic-functions/types/meet-transcript-entry.type';
import { listMeetCollection } from 'src/logic-functions/utils/list-meet-collection.util';

export const listMeetTranscriptEntries = ({
  accessToken,
  transcriptName,
}: {
  accessToken: string;
  transcriptName: string;
}): Promise<MeetTranscriptEntry[]> =>
  listMeetCollection<'transcriptEntries', MeetTranscriptEntry>({
    accessToken,
    path: `${transcriptName}/entries`,
    collectionKey: 'transcriptEntries',
  });
