import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

export const findCallRecordingVideoState = async ({
  coreApiClient,
  callRecordingId,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<{ hasVideo: boolean } | undefined> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: { filter: { id: { eq: callRecordingId } }, first: 1 },
      edges: { node: { id: true, video: { fileId: true } } },
    },
  });
  const node = queryResult.callRecordings?.edges?.[0]?.node;

  if (!isDefined(node)) {
    return undefined;
  }

  return { hasVideo: isNonEmptyArray(node.video) };
};
