import { buildTeamsActivityPath } from 'src/logic-functions/utils/build-teams-activity-path';
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
    path: buildTeamsActivityPath({ conversationId, activityId }),
    method: 'DELETE',
    accessToken,
  });
};
