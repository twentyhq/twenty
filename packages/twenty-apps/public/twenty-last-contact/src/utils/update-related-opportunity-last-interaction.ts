import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isNewer } from 'src/utils/is-newer.util';

export const updateRelatedOpportunityLastInteraction = async (
  client: CoreApiClient,
  personId: string,
  occurredAt: string,
) => {
  const { opportunities } = await client.query({
    opportunities: {
      __args: {
        filter: {
          pointOfContactId: {
            eq: personId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          lastInteraction: true,
        },
      },
    },
  });

  if (
    !opportunities?.edges[0].node.id ||
    !isNewer(occurredAt, opportunities?.edges[0].node.lastInteraction)
  ) {
    return {};
  }

  await client.mutation({
    updateOpportunity: {
      __args: {
        id: opportunities?.edges[0].node.id,
        data: {
          lastInteraction: opportunities?.edges[0].node.lastInteraction,
        },
      },
    },
  });
};
