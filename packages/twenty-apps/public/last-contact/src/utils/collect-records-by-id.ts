import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;

export type RecordQueryField = 'people' | 'companies' | 'opportunities';

export type RecordNode = { id: string } & Record<string, unknown>;

export const collectRecordsById = async (
  client: CoreApiClient,
  queryField: RecordQueryField,
  recordIds: string[],
  fieldNames: string[],
): Promise<Map<string, RecordNode>> => {
  const recordsById = new Map<string, RecordNode>();
  const selection = Object.fromEntries(
    fieldNames.map((fieldName) => [fieldName, true]),
  );

  for (const ids of chunk(recordIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const result = await executeWithRetry(() =>
        client.query({
          [queryField]: {
            __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
            edges: { node: { ...selection, id: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );
      const connection = result?.[queryField];

      for (const edge of connection?.edges ?? []) {
        const node = edge.node as RecordNode;

        if (node.id) {
          recordsById.set(node.id, node);
        }
      }

      after = connection?.pageInfo.hasNextPage
        ? (connection.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return recordsById;
};
