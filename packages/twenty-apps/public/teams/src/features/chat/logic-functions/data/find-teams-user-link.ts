import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsUserLink } from 'src/features/chat/logic-functions/types/teams-user-link.type';
import { isTeamsUserLinkSource } from 'src/features/chat/logic-functions/utils/is-teams-user-link-source';

export const findTeamsUserLink = async ({
  client,
  teamsTenantId,
  teamsUserAadObjectId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  teamsTenantId: string;
  teamsUserAadObjectId: string;
}): Promise<TeamsUserLink | undefined> => {
  const queryResult = await client.query({
    teamsUserLinks: {
      __args: {
        filter: {
          teamsTenantId: { eq: teamsTenantId },
          teamsUserAadObjectId: { eq: teamsUserAadObjectId },
        },
        first: 1,
      },
      edges: {
        node: { id: true, workspaceMemberId: true, source: true },
      },
    },
  });

  const node = queryResult.teamsUserLinks?.edges?.[0]?.node;

  if (!isNonEmptyString(node?.id)) {
    return undefined;
  }

  return {
    id: node.id,
    workspaceMemberId: isNonEmptyString(node.workspaceMemberId)
      ? node.workspaceMemberId
      : undefined,
    source: isTeamsUserLinkSource(node.source) ? node.source : undefined,
  };
};
