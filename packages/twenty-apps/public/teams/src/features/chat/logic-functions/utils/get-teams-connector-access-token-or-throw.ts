import { getTeamsBotCredentials } from 'src/features/chat/logic-functions/utils/get-teams-bot-credentials';
import { getTeamsConnectorToken } from 'src/features/chat/logic-functions/utils/get-teams-connector-token';

export const getTeamsConnectorAccessTokenOrThrow =
  async (): Promise<string> => {
    const credentialsResult = getTeamsBotCredentials();

    if (!credentialsResult.success) {
      throw new Error(credentialsResult.error);
    }

    return await getTeamsConnectorToken(credentialsResult.credentials);
  };
