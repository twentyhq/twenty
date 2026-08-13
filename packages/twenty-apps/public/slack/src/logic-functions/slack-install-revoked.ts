import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_INSTALL_REVOKED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackInstallRevokedHandler } from 'src/logic-functions/handlers/slack-install-revoked-handler';

export default defineLogicFunction({
  universalIdentifier:
    SLACK_INSTALL_REVOKED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'slack-install-revoked',
  description:
    'Runs in the resolved workspace when Slack reports the app was uninstalled from its workspace (app_uninstalled) or its bot token was revoked (tokens_revoked). Releases the server-scoped slack-team claim and the per-connection team entries so the Slack team can be connected again, since the removal happened on the Slack side and never goes through the onDisconnect hook.',
  timeoutSeconds: 30,
  handler: slackInstallRevokedHandler,
});
