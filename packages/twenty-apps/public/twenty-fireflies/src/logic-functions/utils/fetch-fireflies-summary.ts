import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';
import {
  firefliesApiRequest,
  type FirefliesApiResult,
} from 'src/logic-functions/utils/fireflies-api-request';

const SUMMARY_QUERY = `
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
      summary {
        overview
        action_items
        keywords
        topics_discussed
        short_summary
      }
    }
  }
`;

type FirefliesSummaryResponse = {
  transcript: FirefliesTranscript | null;
};

export const fetchFirefliesSummary = async ({
  apiKey,
  transcriptId,
}: {
  apiKey: string;
  transcriptId: string;
}): Promise<FirefliesApiResult<FirefliesTranscript>> => {
  const result = await firefliesApiRequest<FirefliesSummaryResponse>({
    apiKey,
    query: SUMMARY_QUERY,
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
