import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

// ilike gives case-insensitive matching, but it also treats % and _ as
// wildcards, and an address like a_b@example.com must not match aXb@example.com.
const escapeLikeWildcards = (value: string): string =>
  value.replace(/[\\%_]/g, '\\$&');

export const findWorkspaceMemberByEmail = async (
  client: CoreApiClient,
  { email }: { email: string },
): Promise<string | undefined> => {
  const queryResult = await client.query({
    workspaceMembers: {
      __args: {
        filter: { userEmail: { ilike: escapeLikeWildcards(email) } },
        first: 2,
      },
      edges: { node: { id: true } },
    },
  });

  const edges = queryResult.workspaceMembers?.edges ?? [];

  // An email matching more than one member is ambiguous, so leave the link for
  // an admin to create by hand rather than guessing.
  if (edges.length !== 1) {
    return undefined;
  }

  const workspaceMemberId = edges[0]?.node?.id;

  return isNonEmptyString(workspaceMemberId) ? workspaceMemberId : undefined;
};
