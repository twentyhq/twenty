import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import { PAGE_SIZE } from 'src/utils/last-contact/page-size';

export type OpportunityRow = {
  id: string;
  pointOfContactId: string | null;
};

export const collectOpportunities = async (
  client: CoreApiClient,
  opportunityIds?: string[],
): Promise<OpportunityRow[]> => {
  if (opportunityIds && opportunityIds.length === 0) {
    return [];
  }

  const filterArgs = opportunityIds ? { filter: { id: { in: opportunityIds } } } : {};
  const opportunities: OpportunityRow[] = [];
  let after: string | undefined;

  do {
    const { opportunities: page } = await executeWithRetry(() =>
      client.query({
        opportunities: {
          __args: { ...filterArgs, first: PAGE_SIZE, after },
          edges: {
            node: { id: true, pointOfContactId: true },
          },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    for (const edge of page?.edges ?? []) {
      const { id, pointOfContactId } = edge.node;
      if (id) {
        opportunities.push({
          id,
          pointOfContactId: pointOfContactId ?? null,
        });
      }
    }

    after = page?.pageInfo.hasNextPage
      ? (page.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return opportunities;
};
