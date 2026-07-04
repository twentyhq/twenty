import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingForSummary = {
  id: string;
  title: string | undefined;
  transcript: unknown;
  summaryMarkdown: string | undefined;
  createdBy: { source: string | undefined; name: string | undefined };
};

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
          createdBy: { source: true, name: true },
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
    // Blank summaries are not usable; normalize them as missing so generation
    // can repair blank summary records.
    summaryMarkdown: getString(node.summary?.markdown),
    createdBy: {
      source: getString(node.createdBy?.source),
      name: getString(node.createdBy?.name),
    },
  };
};
