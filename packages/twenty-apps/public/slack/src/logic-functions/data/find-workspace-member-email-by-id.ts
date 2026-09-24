import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findWorkspaceMemberEmailById = async (
  client: CoreApiClient,
  workspaceMemberId: string,
): Promise<string | undefined> => {
  const queryResult = await client
    .query({
      workspaceMembers: {
        __args: {
          filter: { id: { eq: workspaceMemberId } },
          first: 1,
        },
        edges: {
          node: { userEmail: true },
        },
      },
    })
    .catch(() => undefined);

  const userEmail = queryResult?.workspaceMembers?.edges?.[0]?.node?.userEmail;

  return isNonEmptyString(userEmail) ? userEmail : undefined;
};
