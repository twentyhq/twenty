import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findCallRecordingForSummary = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}) => {
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

  return queryResult.callRecordings?.edges?.[0]?.node ?? undefined;
};
