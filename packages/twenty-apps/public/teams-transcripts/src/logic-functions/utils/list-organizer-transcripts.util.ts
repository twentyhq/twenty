import { isNonEmptyString } from '@sniptt/guards';

import { MAX_GRAPH_TRANSCRIPT_LIST_PAGES } from 'src/constants/teams.constant';
import { type GraphCallTranscript } from 'src/logic-functions/types/graph-call-transcript.type';
import { type GraphCollectionPage } from 'src/logic-functions/types/graph-collection-page.type';
import { buildOrganizerTranscriptsUrl } from 'src/logic-functions/utils/build-organizer-transcripts-url.util';
import { graphFetchJson } from 'src/logic-functions/utils/graph-fetch.util';

// Graph documents duplicate items across pages during service updates, so
// the result is keyed by transcript id rather than concatenated.
export const listOrganizerTranscripts = async ({
  accessToken,
  organizerUserId,
  startDateTime,
  endDateTime,
}: {
  accessToken: string;
  organizerUserId: string;
  startDateTime?: string;
  endDateTime?: string;
}): Promise<{ transcripts: GraphCallTranscript[]; isTruncated: boolean }> => {
  const transcriptsById = new Map<string, GraphCallTranscript>();
  let nextUrl: string | undefined = buildOrganizerTranscriptsUrl({
    organizerUserId,
    startDateTime,
    endDateTime,
  });

  for (let page = 0; page < MAX_GRAPH_TRANSCRIPT_LIST_PAGES; page++) {
    const pageResult: GraphCollectionPage<GraphCallTranscript> =
      await graphFetchJson<GraphCollectionPage<GraphCallTranscript>>({
        accessToken,
        url: nextUrl,
      });

    for (const transcript of pageResult.value ?? []) {
      transcriptsById.set(transcript.id, transcript);
    }

    const nextLink = pageResult['@odata.nextLink'];

    if (!isNonEmptyString(nextLink) || nextLink === nextUrl) {
      return { transcripts: [...transcriptsById.values()], isTruncated: false };
    }

    nextUrl = nextLink;
  }

  return { transcripts: [...transcriptsById.values()], isTruncated: true };
};
