import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

export const doesCallRecordingMatchFilterOrThrow = async ({
  coreApiClient,
  filter,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  filter: {
    id: { eq: string };
    deletedAt?: { is: 'NOT_NULL' };
  };
}): Promise<boolean> => {
  const queryResult = await coreApiClient.query({
    callRecordings: {
      __args: { filter, first: 1 },
      edges: { node: { id: true } },
    },
  });

  return isDefined(queryResult.callRecordings?.edges?.[0]?.node);
};
