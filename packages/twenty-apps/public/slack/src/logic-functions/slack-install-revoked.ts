import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_INSTALL_REVOKED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackInstallRevokedHandler } from 'src/logic-functions/handlers/slack-install-revoked-handler';

export default defineLogicFunction({
  universalIdentifier:
    SLACK_INSTALL_REVOKED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'slack-install-revoked',
  description:
    'Runs in the resolved workspace when Slack reports the app was uninstalled from its workspace (app_uninstalled) or its bot token was revoked (tokens_revoked). Releases the server-scoped slack-team claim and the per-connection team entries so the Slack team can be connected again. Covers Slack-side removals, which skip the onDisconnect hook entirely, and also fires on Twenty-side disconnects because the server revokes the token at Slack before dispatching that hook; both paths release the same keys idempotently.',
  timeoutSeconds: 30,
  handler: slackInstallRevokedHandler,
});
