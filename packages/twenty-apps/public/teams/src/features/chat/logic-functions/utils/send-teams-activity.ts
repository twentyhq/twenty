import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';
import { buildTeamsActivityPath } from 'src/features/chat/logic-functions/utils/build-teams-activity-path';
import { requestTeamsConnectorJson } from 'src/features/chat/logic-functions/utils/request-teams-connector-json';

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
}): Promise<{ id: string }> =>
  requestTeamsConnectorJson<{ id: string }>({
    serviceUrl,
    path: buildTeamsActivityPath({ conversationId }),
    method: 'POST',
    accessToken,
    body: activity,
  });
