import { type TeamsActivity } from 'src/logic-functions/types/teams-activity.type';
import { parseTeamsConnectorResponseOrThrow } from 'src/logic-functions/utils/parse-teams-connector-response-or-throw';
import { requestTeamsConnector } from 'src/logic-functions/utils/request-teams-connector';

export const updateTeamsActivity = async ({
  serviceUrl,
  conversationId,
  activityId,
  accessToken,
  activity,
}: {
  serviceUrl: string;
  conversationId: string;
  activityId: string;
  accessToken: string;
  activity: TeamsActivity;
}): Promise<{ id: string }> => {
  const path = `/v3/conversations/${encodeURIComponent(conversationId)}/activities/${encodeURIComponent(activityId)}`;

  const responseBody = await requestTeamsConnector({
    serviceUrl,
    path,
    method: 'PUT',
    accessToken,
    body: activity,
  });

  return parseTeamsConnectorResponseOrThrow<{ id: string }>({
    responseBody,
    method: 'PUT',
    path,
  });
};
