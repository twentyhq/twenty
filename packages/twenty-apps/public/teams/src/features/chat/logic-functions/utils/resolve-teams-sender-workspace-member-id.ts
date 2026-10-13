import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findWorkspaceMemberIdByEmail } from 'src/features/chat/logic-functions/data/find-workspace-member-id-by-email';
import { type TeamsConversationMember } from 'src/features/chat/logic-functions/types/teams-conversation-member.type';
import { getTeamsConversationMember } from 'src/features/chat/logic-functions/utils/get-teams-conversation-member';

const isEmailVouchedForByClaimedTenant = ({
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
  client: Pick<CoreApiClient, 'query'>;
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

  if (!isEmailVouchedForByClaimedTenant({ member, teamsTenantId })) {
    return undefined;
  }

  const email = [member.email, member.userPrincipalName].find(isNonEmptyString);

  if (!isDefined(email)) {
    return undefined;
  }

  return await findWorkspaceMemberIdByEmail({ client, email });
};
