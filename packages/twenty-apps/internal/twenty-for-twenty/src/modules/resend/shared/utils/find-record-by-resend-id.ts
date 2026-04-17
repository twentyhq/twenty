import { CoreApiClient } from 'twenty-client-sdk/core';

type ConnectionResult = {
  edges: Array<{ node: { id: string; resendId: string } }>;
};

export const findRecordByResendId = async (
  client: CoreApiClient,
  objectNamePlural: string,
  resendId: string,
): Promise<string | undefined> => {
  const result = await client.query({
    [objectNamePlural]: {
      __args: {
        filter: {
          resendId: { eq: resendId },
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          resendId: true,
        },
      },
    },
  });

  const connection = (result as Record<string, unknown>)[objectNamePlural] as
    | ConnectionResult
    | undefined;

  return connection?.edges[0]?.node.id;
};
