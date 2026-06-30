import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';
import {
  firefliesApiRequest,
  type FirefliesApiResult,
} from 'src/logic-functions/utils/fireflies-api-request';

const TRANSCRIPT_QUERY = `
  query Transcript($transcriptId: String!) {
    transcript(id: $transcriptId) {
      id
      title
      duration
      meeting_link
      participants
      organizer_email
      calendar_id
      cal_id
      calendar_type
      sentences {
        speaker_name
        text
        start_time
      }
    }
  }
`;

type FirefliesTranscriptResponse = {
  transcript: FirefliesTranscript | null;
};

export const fetchFirefliesTranscript = async ({
  apiKey,
  transcriptId,
}: {
  apiKey: string;
  transcriptId: string;
}): Promise<FirefliesApiResult<FirefliesTranscript>> => {
  const result = await firefliesApiRequest<FirefliesTranscriptResponse>({
    apiKey,
    query: TRANSCRIPT_QUERY,
    variables: { transcriptId },
  });

  if (!result.ok) {
    return result;
  }

  if (result.data.transcript === null) {
    return {
      ok: false,
      status: 404,
      errorMessage: `Fireflies transcript ${transcriptId} not found (may have been deleted or access was revoked)`,
    };
  }

  return { ok: true, status: result.status, data: result.data.transcript };
};
