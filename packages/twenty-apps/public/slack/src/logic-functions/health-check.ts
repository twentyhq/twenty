import { defineHealthCheck } from 'twenty-sdk/define';

import { SLACK_HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackHealthCheckHandler } from 'src/logic-functions/handlers/slack-health-check-handler';

export default defineHealthCheck({
  universalIdentifier: SLACK_HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'slack-health-check',
  description:
    'Reports a broken Slack connection as a banner on the app settings page, whichever tab is open: the stored token no longer passes auth.test, or the installed Slack team is claimed by another Twenty workspace, so its messages are delivered elsewhere.',
  timeoutSeconds: 30,
  handler: slackHealthCheckHandler,
});
