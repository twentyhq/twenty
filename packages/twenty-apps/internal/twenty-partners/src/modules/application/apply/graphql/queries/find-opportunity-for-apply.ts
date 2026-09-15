import { type CoreApiClient } from 'twenty-client-sdk/core';

// List form on purpose: the single-record read throws `Record not found` for an unknown id,
// which would hide a missing brief behind the generic failure message.
export function findOpportunityForApply(
  client: CoreApiClient,
  opportunityId: string,
) {
  return client.query({
    opportunities: {
      __args: { filter: { id: { eq: opportunityId } }, first: 1 },
      edges: { node: { id: true, name: true, isListed: true } },
    },
  });
}
