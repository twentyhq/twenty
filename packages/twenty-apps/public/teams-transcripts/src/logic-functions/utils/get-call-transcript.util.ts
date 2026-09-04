import { type GraphCallTranscript } from 'src/logic-functions/types/graph-call-transcript.type';
import { type GraphTranscriptReference } from 'src/logic-functions/types/graph-transcript-reference.type';
import { graphFetchJson } from 'src/logic-functions/utils/graph-fetch.util';

export const getCallTranscript = ({
  accessToken,
  organizerUserId,
  meetingId,
  transcriptId,
}: { accessToken: string } & GraphTranscriptReference): Promise<GraphCallTranscript> =>
  graphFetchJson<GraphCallTranscript>({
    accessToken,
    url: `users/${encodeURIComponent(organizerUserId)}/onlineMeetings/${encodeURIComponent(meetingId)}/transcripts/${encodeURIComponent(transcriptId)}`,
  });
