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
  activity: object;
}): Promise<{ id: string }> =>
  requestTeamsConnector<{ id: string }>({
    serviceUrl,
    path: `/v3/conversations/${encodeURIComponent(conversationId)}/activities/${encodeURIComponent(activityId)}`,
    method: 'PUT',
    accessToken,
    body: activity,
  });
