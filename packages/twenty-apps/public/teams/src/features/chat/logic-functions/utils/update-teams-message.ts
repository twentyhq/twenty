import { buildTeamsMessageActivity } from 'src/features/chat/logic-functions/utils/build-teams-message-activity';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { updateTeamsActivity } from 'src/features/chat/logic-functions/utils/update-teams-activity';

export const updateTeamsMessage = async ({
  serviceUrl,
  conversationId,
  activityId,
  text,
}: {
  serviceUrl: string;
  conversationId: string;
  activityId: string;
  text: string;
}): Promise<{ id: string }> =>
  updateTeamsActivity({
    serviceUrl,
    conversationId,
    activityId,
    accessToken: await getTeamsConnectorAccessTokenOrThrow(),
    activity: buildTeamsMessageActivity({ text }),
  });
