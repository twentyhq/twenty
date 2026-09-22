import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { listMeetingTranscriptPages } from 'src/features/transcripts/logic-functions/utils/list-meeting-transcript-pages.util';

export const listMeetingTranscripts = ({
  accessToken,
  meetingId,
}: {
  accessToken: string;
  meetingId: string;
}): Promise<GraphCallTranscript[]> =>
  listMeetingTranscriptPages({
    accessToken,
    meetingId,
    url: `me/onlineMeetings/${encodeURIComponent(meetingId)}/transcripts`,
    pageIndex: 0,
  });
