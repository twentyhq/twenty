import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;

export const collectPeopleByCompany = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<Map<string, string[]>> => {
  const peopleByCompanyId = new Map<string, string[]>();
  let after: string | undefined;

  do {
    const { people } = await executeWithRetry(() =>
      client.query({
        people: {
          __args: {
            filter: { companyId: { in: companyIds } },
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
        const existing = peopleByCompanyId.get(companyId);
        if (existing) {
          existing.push(id);
        } else {
          peopleByCompanyId.set(companyId, [id]);
        }
      }
    }

    after = people?.pageInfo.hasNextPage
      ? (people.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return peopleByCompanyId;
};
