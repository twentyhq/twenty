import { type TeamsAssistantAnswerMarkers } from 'src/features/chat/logic-functions/types/teams-assistant-answer-markers.type';
import { buildTeamsMessageActivity } from 'src/features/chat/logic-functions/utils/build-teams-message-activity';
import { getTeamsConnectorAccessTokenOrThrow } from 'src/features/chat/logic-functions/utils/get-teams-connector-access-token-or-throw';
import { sendTeamsActivity } from 'src/features/chat/logic-functions/utils/send-teams-activity';

export const sendTeamsMessage = async ({
  serviceUrl,
  conversationId,
  text,
  answerMarkers,
}: {
  serviceUrl: string;
  conversationId: string;
  text: string;
  answerMarkers?: TeamsAssistantAnswerMarkers;
}): Promise<{ id: string }> =>
  sendTeamsActivity({
    serviceUrl,
    conversationId,
    accessToken: await getTeamsConnectorAccessTokenOrThrow(),
    activity: buildTeamsMessageActivity({ text, ...answerMarkers }),
  });
