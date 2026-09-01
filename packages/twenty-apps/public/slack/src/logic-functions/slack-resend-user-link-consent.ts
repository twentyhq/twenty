import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_USER_LINKS_RESEND_CONSENT_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { SLACK_RESEND_USER_LINK_CONSENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackResendUserLinkConsentHandler } from 'src/logic-functions/handlers/slack-resend-user-link-consent-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_RESEND_USER_LINK_CONSENT_UNIVERSAL_IDENTIFIER,
  name: 'slack-resend-user-link-consent',
  description:
    'Resends the Slack consent request for a pending manual user link. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: SLACK_USER_LINKS_RESEND_CONSENT_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: slackResendUserLinkConsentHandler,
});
