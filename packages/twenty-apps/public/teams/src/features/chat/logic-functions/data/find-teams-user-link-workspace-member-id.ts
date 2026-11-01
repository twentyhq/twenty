import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findTeamsUserLinkWorkspaceMemberId = async ({
  client,
  teamsTenantId,
  teamsUserAadObjectId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  teamsTenantId: string;
  teamsUserAadObjectId: string;
}): Promise<string | undefined> => {
  const queryResult = await client.query({
    teamsUserLinks: {
      __args: {
        filter: {
          teamsTenantId: { eq: teamsTenantId },
          teamsUserAadObjectId: { eq: teamsUserAadObjectId },
        },
        first: 1,
      },
      edges: { node: { workspaceMemberId: true } },
    },
  });

  const workspaceMemberId =
    queryResult.teamsUserLinks?.edges?.[0]?.node?.workspaceMemberId;

  return isNonEmptyString(workspaceMemberId) ? workspaceMemberId : undefined;
};
