import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type TeamsUserLinkSource } from 'src/features/chat/logic-functions/types/teams-user-link-source.type';

export const updateTeamsUserLink = async ({
  client,
  id,
  workspaceMemberId,
  name,
  source,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  workspaceMemberId?: string;
  name?: string;
  source?: TeamsUserLinkSource;
}): Promise<void> => {
  await client.mutation({
    updateTeamsUserLink: {
      __args: {
        id,
        data: {
          ...(isNonEmptyString(workspaceMemberId) ? { workspaceMemberId } : {}),
          ...(isNonEmptyString(name) ? { name } : {}),
          ...(isDefined(source) ? { source } : {}),
        },
      },
      id: true,
    },
  });
};
