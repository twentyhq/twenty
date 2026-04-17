import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

const PAGE_SIZE = 100;

type ExistingRecord = {
  id: string;
  resendId: string;
};

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type ConnectionResult = {
  pageInfo: PageInfo;
  edges: Array<{ node: ExistingRecord }>;
};

export const getExistingRecordsMap = async (
  client: CoreApiClient,
  objectNamePlural: string,
): Promise<Map<string, string>> => {
  const map = new Map<string, string>();

  let hasNextPage = true;

  let afterCursor: string | undefined;

  while (hasNextPage) {
    const args: Record<string, unknown> = { first: PAGE_SIZE };

    if (isDefined(afterCursor)) {
      args.after = afterCursor;
    }

    const result = await client.query({
      [objectNamePlural]: {
        __args: args,
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

    const connection = (result as Record<string, unknown>)[objectNamePlural] as
      | ConnectionResult
      | undefined;

    const edges = connection?.edges ?? [];

    for (const edge of edges) {
      if (isDefined(edge.node.resendId)) {
        map.set(edge.node.resendId, edge.node.id);
      }
    }

    hasNextPage = connection?.pageInfo.hasNextPage ?? false;
    afterCursor = connection?.pageInfo.endCursor ?? undefined;
  }

  return map;
};
