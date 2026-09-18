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
  activity: object;
}): Promise<{ id: string }> =>
  requestTeamsConnector<{ id: string }>({
    serviceUrl,
    path: `/v3/conversations/${encodeURIComponent(conversationId)}/activities`,
    method: 'POST',
    accessToken,
    body: activity,
  });
