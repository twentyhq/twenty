import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findWorkspaceMemberIdByEmail } from 'src/features/chat/logic-functions/data/find-workspace-member-id-by-email';
import { getTeamsConversationMember } from 'src/features/chat/logic-functions/utils/get-teams-conversation-member';

export const resolveTeamsSenderWorkspaceMemberId = async ({
  client,
  serviceUrl,
  conversationId,
  teamsUserId,
  accessToken,
}: {
  client: CoreApiClient;
  serviceUrl: string;
  conversationId: string;
  teamsUserId: string;
  accessToken: string;
}): Promise<string | undefined> => {
  const member = await getTeamsConversationMember({
    serviceUrl,
    conversationId,
    memberId: teamsUserId,
    accessToken,
  });

  const email = [member.email, member.userPrincipalName].find(isNonEmptyString);

  if (!isNonEmptyString(email)) {
    return undefined;
  }

  return await findWorkspaceMemberIdByEmail({ client, email });
};
