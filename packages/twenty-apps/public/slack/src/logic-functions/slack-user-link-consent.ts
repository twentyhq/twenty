import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINK_CONSENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackUserLinkConsentHandler } from 'src/logic-functions/handlers/slack-user-link-consent-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_USER_LINK_CONSENT_UNIVERSAL_IDENTIFIER,
  name: 'slack-user-link-consent',
  description:
    'Runs in the resolved workspace: records the Approve or Decline decision a Slack user made on the consent request for a manual Slack user link, and refreshes the message they acted on.',
  timeoutSeconds: 15,
  handler: slackUserLinkConsentHandler,
});
