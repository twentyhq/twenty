import { type TeamsConversationMember } from 'src/logic-functions/types/teams-conversation-member.type';
import { parseTeamsConnectorResponseOrThrow } from 'src/logic-functions/utils/parse-teams-connector-response-or-throw';
import { requestTeamsConnector } from 'src/logic-functions/utils/request-teams-connector';

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
}): Promise<TeamsConversationMember> => {
  const path = `/v3/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(memberId)}`;

  const responseBody = await requestTeamsConnector({
    serviceUrl,
    path,
    method: 'GET',
    accessToken,
  });

  return parseTeamsConnectorResponseOrThrow<TeamsConversationMember>({
    responseBody,
    method: 'GET',
    path,
  });
};
