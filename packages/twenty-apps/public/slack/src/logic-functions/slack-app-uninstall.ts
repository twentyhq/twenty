import { defineUninstallLogicFunction } from 'twenty-sdk/define';

import { SLACK_APP_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackAppUninstallHandler } from 'src/logic-functions/handlers/slack-app-uninstall-handler';

export default defineUninstallLogicFunction({
  universalIdentifier: SLACK_APP_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'slack-app-uninstall',
  description:
    'Runs when the app is uninstalled, before its metadata is deleted. Releases the server-scoped slack-team claim of every remaining Slack connection, since uninstalling cascade-deletes the connections without going through the onDisconnect hook.',
  timeoutSeconds: 30,
  handler: slackAppUninstallHandler,
});
