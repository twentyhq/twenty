import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type CallRecordingForSummary } from 'src/logic-functions/types/call-recording-for-summary.type';

export const findCallRecordingForSummary = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<CallRecordingForSummary | undefined> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: { filter: { id: { eq: callRecordingId } }, first: 1 },
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

  if (!isDefined(node)) {
    return undefined;
  }

  return {
    title: node.title ?? undefined,
    transcript: node.transcript,
    summaryMarkdown: node.summary?.markdown ?? undefined,
  };
};
