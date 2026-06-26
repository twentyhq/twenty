import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getString } from 'src/logic-functions/utils/get-string.util';

export type CallRecordingForSummary = {
  id: string;
  title: string | undefined;
  transcript: unknown;
  summaryMarkdown: string | undefined;
};

// Re-reads the authoritative transcript and summary by id rather than trusting
// the database-event payload, which may not carry the full transcript.
export const findCallRecordingForSummary = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<CallRecordingForSummary | undefined> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: id } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          title: true,
          transcript: true,
          summary: { markdown: true },
        },
      },
    },
  });

  const node = queryResult.callRecordings?.edges?.[0]?.node;

  if (isUndefined(node) || isNull(node)) {
    return undefined;
  }

  return {
    id: node.id,
    title: getString(node.title),
    transcript: node.transcript ?? undefined,
    summaryMarkdown: getString(node.summary?.markdown),
  };
};
