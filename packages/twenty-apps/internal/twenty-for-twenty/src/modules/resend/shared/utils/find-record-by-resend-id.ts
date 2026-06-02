import { CoreApiClient } from 'twenty-client-sdk/core';

import { extractConnection } from '@modules/resend/shared/utils/typed-client';

type ResendIdNode = { id: string; resendId: string };

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

  const connection = extractConnection<ResendIdNode>(result, objectNamePlural);

  return connection.edges[0]?.node.id;
};
