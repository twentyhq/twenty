import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { TWENTY_PAGE_SIZE } from '@modules/resend/constants/sync-config';
import { extractConnection } from '@modules/resend/shared/utils/typed-client';

type ExistingRecord = {
  id: string;
  resendId: string;
};

export const fetchExistingTwentyIdsByResendIds = async (
  client: CoreApiClient,
  objectNamePlural: string,
  resendIds: ReadonlyArray<string>,
): Promise<Map<string, string>> => {
  const map = new Map<string, string>();

  if (resendIds.length === 0) {
    return map;
  }

  const result = await client.query({
    [objectNamePlural]: {
      __args: {
        filter: {
          resendId: { in: [...resendIds] },
        },
        first: Math.max(resendIds.length, TWENTY_PAGE_SIZE),
      },
      edges: {
        node: {
          id: true,
          resendId: true,
        },
      },
    },
  });

  const connection = extractConnection<ExistingRecord>(
    result,
    objectNamePlural,
  );

  for (const edge of connection.edges) {
    if (isDefined(edge.node.resendId)) {
      map.set(edge.node.resendId, edge.node.id);
    }
  }

  return map;
};
