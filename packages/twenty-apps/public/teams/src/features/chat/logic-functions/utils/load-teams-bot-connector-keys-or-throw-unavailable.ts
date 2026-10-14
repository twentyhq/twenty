import { type LoadTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/types/load-teams-bot-connector-keys.type';
import { TeamsBotConnectorKeysUnavailableError } from 'src/features/chat/logic-functions/types/teams-bot-connector-keys-unavailable-error';
import { getTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/utils/get-teams-bot-connector-keys';
import { toErrorMessage } from 'src/utils/to-error-message';

export const loadTeamsBotConnectorKeysOrThrowUnavailable: LoadTeamsBotConnectorKeys =
  async (options) => {
    try {
      return await getTeamsBotConnectorKeys(options);
    } catch (error) {
      throw new TeamsBotConnectorKeysUnavailableError(toErrorMessage(error));
    }
  };
