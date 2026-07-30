import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import { PAGE_SIZE } from 'src/utils/last-contact/page-size';

export const collectPersonCompanies = async (
  client: CoreApiClient,
  companyIds?: string[],
): Promise<Map<string, string>> => {
  if (companyIds && companyIds.length === 0) {
    return new Map();
  }

  const companyFilter = companyIds
    ? { companyId: { in: companyIds } }
    : { companyId: { is: 'NOT_NULL' } };
  const companyByPersonId = new Map<string, string>();
  let after: string | undefined;

  do {
    const { people } = await executeWithRetry(() =>
      client.query({
        people: {
          __args: {
            filter: companyFilter,
            first: PAGE_SIZE,
            after,
          },
          edges: { node: { id: true, companyId: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    for (const edge of people?.edges ?? []) {
      const { id, companyId } = edge.node;
      if (id && companyId) {
        companyByPersonId.set(id, companyId);
      }
    }

    after = people?.pageInfo.hasNextPage
      ? (people.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return companyByPersonId;
};
