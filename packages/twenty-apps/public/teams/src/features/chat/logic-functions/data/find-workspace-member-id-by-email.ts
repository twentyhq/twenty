import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { escapeSqlLikePattern } from 'src/features/chat/logic-functions/utils/escape-sql-like-pattern';

export const findWorkspaceMemberIdByEmail = async ({
  client,
  email,
}: {
  client: CoreApiClient;
  email: string;
}): Promise<string | undefined> => {
  const queryResult = await client.query({
    workspaceMembers: {
      __args: {
        filter: { userEmail: { ilike: escapeSqlLikePattern(email) } },
        first: 2,
      },
      edges: { node: { id: true } },
    },
  });

  const matchingMemberIds = (queryResult.workspaceMembers?.edges ?? [])
    .map((edge: { node?: { id?: string } }) => edge.node?.id)
    .filter(isNonEmptyString);

  return matchingMemberIds.length === 1 ? matchingMemberIds[0] : undefined;
};
