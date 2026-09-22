import { type TeamsConversationMember } from 'src/logic-functions/types/teams-conversation-member.type';
import { requestTeamsConnectorJson } from 'src/logic-functions/utils/request-teams-connector-json';

export const getTeamsConversationMember = async ({
  serviceUrl,
  conversationId,
  memberId,
  accessToken,
}: {
  serviceUrl: string;
  conversationId: string;
  memberId: string;
  accessToken: string;
}): Promise<TeamsConversationMember> =>
  requestTeamsConnectorJson<TeamsConversationMember>({
    serviceUrl,
    path: `/v3/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(memberId)}`,
    method: 'GET',
    accessToken,
  });
