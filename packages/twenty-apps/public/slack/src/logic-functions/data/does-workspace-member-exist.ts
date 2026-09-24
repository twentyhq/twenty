import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

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
