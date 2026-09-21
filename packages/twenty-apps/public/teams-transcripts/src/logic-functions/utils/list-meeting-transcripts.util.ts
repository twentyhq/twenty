import { isNonEmptyString } from '@sniptt/guards';

import { MAX_GRAPH_TRANSCRIPT_LIST_PAGES } from 'src/constants/teams.constant';
import { type GraphCallTranscript } from 'src/logic-functions/types/graph-call-transcript.type';
import { type GraphCollectionPage } from 'src/logic-functions/types/graph-collection-page.type';
import { graphFetchJson } from 'src/logic-functions/utils/graph-fetch-json.util';

const listTranscriptPages = async ({
  accessToken,
  meetingId,
  url,
  pageIndex,
}: {
  accessToken: string;
  meetingId: string;
  url: string;
  pageIndex: number;
}): Promise<GraphCallTranscript[]> => {
  if (pageIndex >= MAX_GRAPH_TRANSCRIPT_LIST_PAGES) {
    throw new Error('Microsoft transcript pagination exceeded its limit');
  }

  const page = await graphFetchJson<
    GraphCollectionPage<Pick<GraphCallTranscript, 'id' | 'createdDateTime'>>
  >({ accessToken, url });
  const transcripts = (page.value ?? []).map((transcript) => ({
    id: transcript.id,
    meetingId,
    createdDateTime: transcript.createdDateTime ?? null,
  }));
  const nextPageUrl = page['@odata.nextLink'];

  if (!isNonEmptyString(nextPageUrl)) {
    return transcripts;
  }

  return [
    ...transcripts,
    ...(await listTranscriptPages({
      accessToken,
      meetingId,
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
  listTranscriptPages({
    accessToken,
    meetingId,
    url: `me/onlineMeetings/${encodeURIComponent(meetingId)}/transcripts`,
    pageIndex: 0,
  });
