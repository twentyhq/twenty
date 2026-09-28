import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;

export type RecordQueryField = 'people' | 'companies' | 'opportunities';

export const collectExistingRecordIds = async (
  client: CoreApiClient,
  queryField: RecordQueryField,
  recordIds: string[],
): Promise<Set<string>> => {
  const existingRecordIds = new Set<string>();

  for (const ids of chunk(recordIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const result = await executeWithRetry(() =>
        client.query({
          [queryField]: {
            __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
            edges: { node: { id: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );
      const connection = result?.[queryField];

      for (const edge of connection?.edges ?? []) {
        if (edge.node.id) {
          existingRecordIds.add(edge.node.id);
        }
      }

      after = connection?.pageInfo.hasNextPage
        ? (connection.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return existingRecordIds;
};
