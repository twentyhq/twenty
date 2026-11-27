import { buildTeamsMessageActivity } from 'src/features/chat/logic-functions/utils/build-teams-message-activity';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';

export const sendTeamsMessage = async ({
  serviceUrl,
  conversationId,
  text,
}: {
  serviceUrl: string;
  conversationId: string;
  text: string;
}): Promise<{ id: string }> =>
  sendTeamsActivity({
    serviceUrl,
    conversationId,
    accessToken: await getTeamsConnectorAccessTokenOrThrow(),
    activity: buildTeamsMessageActivity({ text }),
  });
