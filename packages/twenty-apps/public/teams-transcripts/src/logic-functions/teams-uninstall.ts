import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import { GRAPH_ACCESS_TOKEN_KEY_VALUE_KEY } from 'src/constants/teams.constant';
import { TEAMS_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const teamsUninstallHandler = async (): Promise<{ success: true }> => {
  await kv.delete(GRAPH_ACCESS_TOKEN_KEY_VALUE_KEY);

  return { success: true };
};

export default defineUninstallLogicFunction({
  universalIdentifier: TEAMS_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'teams-uninstall',
  description:
    'Drops the cached Microsoft Graph access token when the app is uninstalled.',
  timeoutSeconds: 15,
  handler: teamsUninstallHandler,
});
