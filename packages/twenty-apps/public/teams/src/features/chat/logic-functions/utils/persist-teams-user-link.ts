import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';
import { createTeamsUserLink } from 'src/features/chat/logic-functions/data/create-teams-user-link';
import { updateTeamsUserLink } from 'src/features/chat/logic-functions/data/update-teams-user-link';
import { type TeamsUserLink } from 'src/features/chat/logic-functions/types/teams-user-link.type';

export const persistTeamsUserLink = async ({
  client,
  existingLink,
  teamsTenantId,
  teamsUserAadObjectId,
  workspaceMemberId,
  name,
}: {
  client: CoreApiClient;
  existingLink: TeamsUserLink | undefined;
  teamsTenantId: string;
  teamsUserAadObjectId: string;
  workspaceMemberId: string;
  name: string | undefined;
}): Promise<void> => {
  if (isDefined(existingLink)) {
    await updateTeamsUserLink({
      client,
      id: existingLink.id,
      workspaceMemberId,
      name,
      source: TEAMS_USER_LINK_SOURCE.MANUAL,
    });

    return;
  }

  await createTeamsUserLink({
    client,
    teamsTenantId,
    teamsUserAadObjectId,
    workspaceMemberId,
    name: isNonEmptyString(name) ? name : teamsUserAadObjectId,
    source: TEAMS_USER_LINK_SOURCE.MANUAL,
  });
};
