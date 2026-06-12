import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { TWENTY_PAGE_SIZE } from '@modules/resend/constants/sync-config';
import { extractConnection } from '@modules/resend/shared/utils/typed-client';

type ExistingRecord = {
  id: string;
  resendId: string;
};

export const getExistingRecordsMap = async (
  client: CoreApiClient,
  objectNamePlural: string,
): Promise<Map<string, string>> => {
  const map = new Map<string, string>();

  let hasNextPage = true;

  let afterCursor: string | undefined;

  while (hasNextPage) {
    const connectionArguments: Record<string, unknown> = {
      first: TWENTY_PAGE_SIZE,
    };

    if (isDefined(afterCursor)) {
      connectionArguments.after = afterCursor;
    }

    const result = await client.query({
      [objectNamePlural]: {
        __args: connectionArguments,
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
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

    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    afterCursor = connection.pageInfo?.endCursor ?? undefined;
  }

  return map;
};
