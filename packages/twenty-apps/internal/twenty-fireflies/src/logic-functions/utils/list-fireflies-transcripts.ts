import { isDefined } from 'twenty-shared/utils';

import { type FirefliesCallSummary } from 'src/logic-functions/types/fireflies-call-list-result.type';
import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';
import {
  firefliesApiRequest,
  type FirefliesApiResult,
} from 'src/logic-functions/utils/fireflies-api-request';

const TRANSCRIPTS_QUERY = `
  query Transcripts(
    $keyword: String
    $scope: String
    $participants: [String!]
    $fromDate: DateTime
    $toDate: DateTime
    $limit: Int
  ) {
    transcripts(
      keyword: $keyword
      scope: $scope
      participants: $participants
      fromDate: $fromDate
      toDate: $toDate
      limit: $limit
    ) {
      id
      title
      date
      duration
      participants
      host_email
      transcript_url
      meeting_link
    }
  }
`;

type TranscriptsResponse = {
  transcripts: FirefliesTranscript[] | null;
};

export type FirefliesKeywordScope = 'title' | 'sentences' | 'all';

export type ListFirefliesTranscriptsArgs = {
  apiKey: string;
  keyword?: string;
  keywordScope?: FirefliesKeywordScope;
  participants?: string[];
  fromDate?: string;
  toDate?: string;
  limit?: number;
};

const toCallSummary = (transcript: FirefliesTranscript): FirefliesCallSummary => ({
  id: transcript.id,
  title: transcript.title,
  date: isDefined(transcript.date) ? new Date(transcript.date).toISOString() : null,
  durationMinutes: transcript.duration,
  participants: transcript.participants,
  hostEmail: transcript.host_email ?? transcript.organizer_email ?? null,
  transcriptUrl: transcript.transcript_url ?? null,
  meetingLink: transcript.meeting_link,
});

export const listFirefliesTranscripts = async ({
  apiKey,
  keyword,
  keywordScope,
  participants,
  fromDate,
  toDate,
  limit,
}: ListFirefliesTranscriptsArgs): Promise<
  FirefliesApiResult<FirefliesCallSummary[]>
> => {
  const result = await firefliesApiRequest<TranscriptsResponse>({
    apiKey,
    query: TRANSCRIPTS_QUERY,
    variables: {
      keyword,
      scope: keywordScope,
      participants,
      fromDate,
      toDate,
      limit,
    },
  });

  if (!result.ok) {
    return result;
  }

  const transcripts = result.data.transcripts ?? [];

  return {
    ok: true,
    status: result.status,
    data: transcripts.map(toCallSummary),
  };
};
