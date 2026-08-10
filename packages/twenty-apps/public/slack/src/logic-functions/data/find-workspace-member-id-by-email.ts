import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

type WorkspaceMemberEmailEdge = {
  node?: { id?: string; userEmail?: string | null } | null;
} | null;

// `ilike` treats `%` and `_` as wildcards and an email may legitimately contain
// them, so the query only narrows the candidates and the match is decided by an
// exact case-insensitive comparison. An ambiguous result binds nobody.
export const findWorkspaceMemberIdByEmail = async (
  client: CoreApiClient,
  email: string,
): Promise<string | undefined> => {
  const queryResult = await client.query({
    workspaceMembers: {
      __args: {
        filter: { userEmail: { ilike: email } },
        first: 10,
      },
      edges: { node: { id: true, userEmail: true } },
    },
  });

  const normalizedEmail = email.toLowerCase();

  const matchingMemberIds = (
    (queryResult.workspaceMembers?.edges ?? []) as WorkspaceMemberEmailEdge[]
  )
    .filter(
      (edge) =>
        isNonEmptyString(edge?.node?.userEmail) &&
        edge.node.userEmail.toLowerCase() === normalizedEmail,
    )
    .map((edge) => edge?.node?.id)
    .filter(isNonEmptyString);

  return matchingMemberIds.length === 1 ? matchingMemberIds[0] : undefined;
};
