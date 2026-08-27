import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

// Feeds the email-match check that skips consent; a failed read must resolve
// to undefined (no match) so the consent flow stays the fallback, never throw.
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
