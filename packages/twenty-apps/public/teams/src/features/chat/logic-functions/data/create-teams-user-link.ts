import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type TeamsUserLinkSource } from 'src/features/chat/logic-functions/types/teams-user-link-source.type';

export const createTeamsUserLink = async ({
  client,
  name,
  teamsTenantId,
  teamsUserAadObjectId,
  workspaceMemberId,
  source,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  name?: string;
  teamsTenantId: string;
  teamsUserAadObjectId: string;
  workspaceMemberId: string;
  source: TeamsUserLinkSource;
}): Promise<void> => {
  await client.mutation({
    createTeamsUserLink: {
      __args: {
        data: {
          name,
          teamsTenantId,
          teamsUserAadObjectId,
          workspaceMemberId,
          source,
        },
      },
      id: true,
    },
  });
};
