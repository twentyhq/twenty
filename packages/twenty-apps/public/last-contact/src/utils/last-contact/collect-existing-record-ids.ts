import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import { PAGE_SIZE } from 'src/utils/last-contact/page-size';

// Records can be deleted between the moment the user selects them and the
// moment the batch runs; updating a missing id fails the whole batch, so
// unknown ids are dropped up front.
export const collectExistingRecordIds = async (
  client: CoreApiClient,
  objectNamePlural: string,
  ids: string[],
): Promise<string[]> => {
  if (ids.length === 0) {
    return [];
  }

  const existingIds: string[] = [];
  let after: string | undefined;

  do {
    const result = await executeWithRetry(() =>
      client.query({
        [objectNamePlural]: {
          __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
          edges: { node: { id: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    const page = (result as Record<string, unknown>)[objectNamePlural] as
      | {
          edges: { node: { id: string | null } }[];
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
        }
      | null
      | undefined;

    for (const edge of page?.edges ?? []) {
      if (edge.node.id) {
        existingIds.push(edge.node.id);
      }
    }

    after = page?.pageInfo.hasNextPage
      ? (page.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return existingIds;
};
