import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';
import { createTeamsUserLink } from 'src/features/chat/logic-functions/data/create-teams-user-link';
import { findTeamsUserLinkWorkspaceMemberId } from 'src/features/chat/logic-functions/data/find-teams-user-link-workspace-member-id';
import { findWorkspaceMemberIdByEmail } from 'src/features/chat/logic-functions/data/find-workspace-member-id-by-email';
import { type TeamsConversationMember } from 'src/features/chat/logic-functions/types/teams-conversation-member.type';
import { getTeamsConversationMember } from 'src/features/chat/logic-functions/utils/get-teams-conversation-member';

const isMemberOfClaimedTenant = ({
  member,
  teamsTenantId,
}: {
  member: TeamsConversationMember;
  teamsTenantId: string;
}): boolean => member.tenantId === teamsTenantId;

export const resolveTeamsSenderWorkspaceMemberId = async ({
  client,
  serviceUrl,
  conversationId,
  teamsUserId,
  teamsTenantId,
  accessToken,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  serviceUrl: string;
  conversationId: string;
  teamsUserId: string;
  teamsTenantId: string;
  accessToken: string;
}): Promise<string | undefined> => {
  const member = await getTeamsConversationMember({
    serviceUrl,
    conversationId,
    memberId: teamsUserId,
    accessToken,
  });

  if (!isMemberOfClaimedTenant({ member, teamsTenantId })) {
    return undefined;
  }

  const teamsUserAadObjectId = member.objectId;

  if (isNonEmptyString(teamsUserAadObjectId)) {
    const linkedWorkspaceMemberId = await findTeamsUserLinkWorkspaceMemberId({
      client,
      teamsTenantId,
      teamsUserAadObjectId,
    });

    if (isDefined(linkedWorkspaceMemberId)) {
      return linkedWorkspaceMemberId;
    }
  }

  const email = [member.email, member.userPrincipalName].find(isNonEmptyString);

  if (!isDefined(email)) {
    return undefined;
  }

  const workspaceMemberId = await findWorkspaceMemberIdByEmail({
    client,
    email,
  });

  if (isDefined(workspaceMemberId) && isNonEmptyString(teamsUserAadObjectId)) {
    await createTeamsUserLink({
      client,
      name: member.name,
      teamsTenantId,
      teamsUserAadObjectId,
      workspaceMemberId,
      source: TEAMS_USER_LINK_SOURCE.AUTO,
    }).catch((error: unknown) =>
      console.warn(
        `[teams] could not save the user link for ${teamsUserAadObjectId}`,
        error,
      ),
    );
  }

  return workspaceMemberId;
};
