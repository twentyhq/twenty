import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { extractConnection } from '@modules/resend/shared/utils/typed-client';

type ResendIdNode = {
  id: string;
  resendId?: string | null;
};

export const findTwentyIdsByResendId = async (
  client: CoreApiClient,
  objectNamePlural: string,
  resendIds: ReadonlyArray<string | undefined | null>,
): Promise<Map<string, string>> => {
  const map = new Map<string, string>();

  const filteredIds = Array.from(
    new Set(
      resendIds.filter(
        (resendId): resendId is string =>
          typeof resendId === 'string' && resendId.length > 0,
      ),
    ),
  );

  if (filteredIds.length === 0) return map;

  const result = await client.query({
    [objectNamePlural]: {
      __args: {
        filter: {
          resendId: { in: filteredIds },
        },
        first: filteredIds.length,
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

  for (const edge of connection.edges) {
    if (isDefined(edge.node.resendId)) {
      map.set(edge.node.resendId, edge.node.id);
    }
  }

  return map;
};
