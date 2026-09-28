import { isNonEmptyString } from '@sniptt/guards';

import { MAX_GRAPH_TRANSCRIPT_LIST_PAGES } from 'src/features/transcripts/logic-functions/constants/max-graph-transcript-list-pages';
import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';

const listMeetingTranscriptPages = async ({
  accessToken,
  url,
  pageIndex,
}: {
  accessToken: string;
  url: string;
  pageIndex: number;
}): Promise<GraphCallTranscript[]> => {
  if (pageIndex >= MAX_GRAPH_TRANSCRIPT_LIST_PAGES) {
    throw new Error('Microsoft transcript pagination exceeded its limit');
  }

  const page = await fetchGraphJson<GraphCollectionPage<GraphCallTranscript>>({
    accessToken,
    url,
  });
  const transcripts = page.value ?? [];
  const nextPageUrl = page['@odata.nextLink'];

  if (!isNonEmptyString(nextPageUrl)) {
    return transcripts;
  }

  return [
    ...transcripts,
    ...(await listMeetingTranscriptPages({
      accessToken,
      url: nextPageUrl,
      pageIndex: pageIndex + 1,
    })),
  ];
};

export const listMeetingTranscripts = ({
  accessToken,
  meetingId,
}: {
  accessToken: string;
  meetingId: string;
}): Promise<GraphCallTranscript[]> =>
  listMeetingTranscriptPages({
    accessToken,
    url: `me/onlineMeetings/${encodeURIComponent(meetingId)}/transcripts`,
    pageIndex: 0,
  });
