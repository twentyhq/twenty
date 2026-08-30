import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

// Existence gate for the save path: a link is a permission grant, so a member
// id the workspace cannot confirm must fail the save instead of persisting a
// dangling grant. Unlike the best-effort name/email reads, an API failure
// throws so it is not mistaken for "no such member".
export const doesWorkspaceMemberExist = async (
  client: CoreApiClient,
  workspaceMemberId: string,
): Promise<boolean> => {
  const queryResult = await client.query({
    workspaceMembers: {
      __args: {
        filter: { id: { eq: workspaceMemberId } },
        first: 1,
      },
      edges: {
        node: { id: true },
      },
    },
  });

  return isNonEmptyString(queryResult.workspaceMembers?.edges?.[0]?.node?.id);
};
