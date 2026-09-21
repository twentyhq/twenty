import { type TeamsActivity } from 'src/logic-functions/types/teams-activity.type';
import { parseTeamsConnectorResponseOrThrow } from 'src/logic-functions/utils/parse-teams-connector-response-or-throw';
import { requestTeamsConnector } from 'src/logic-functions/utils/request-teams-connector';

export const sendTeamsActivity = async ({
  serviceUrl,
  conversationId,
  accessToken,
  activity,
}: {
  serviceUrl: string;
  conversationId: string;
  accessToken: string;
  activity: TeamsActivity;
}): Promise<{ id: string }> => {
  const path = `/v3/conversations/${encodeURIComponent(conversationId)}/activities`;

  const responseBody = await requestTeamsConnector({
    serviceUrl,
    path,
    method: 'POST',
    accessToken,
    body: activity,
  });

  return parseTeamsConnectorResponseOrThrow<{ id: string }>({
    responseBody,
    method: 'POST',
    path,
  });
};
