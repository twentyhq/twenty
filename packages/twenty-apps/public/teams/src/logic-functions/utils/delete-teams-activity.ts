import { requestTeamsConnector } from 'src/logic-functions/utils/request-teams-connector';

export const deleteTeamsActivity = async ({
  serviceUrl,
  conversationId,
  activityId,
  accessToken,
}: {
  serviceUrl: string;
  conversationId: string;
  activityId: string;
  accessToken: string;
}): Promise<void> => {
  await requestTeamsConnector({
    serviceUrl,
    path: `/v3/conversations/${encodeURIComponent(conversationId)}/activities/${encodeURIComponent(activityId)}`,
    method: 'DELETE',
    accessToken,
  });
};
