import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_STALE_REQUEST_SWEEPER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_STALE_REQUEST_SWEEPER_CRON_PATTERN } from 'src/logic-functions/constants/slack-stale-request-sweeper-cron-pattern';
import { failStaleSlackAssistantRequests } from 'src/logic-functions/utils/fail-stale-slack-assistant-requests';

export default defineLogicFunction({
  universalIdentifier: SLACK_STALE_REQUEST_SWEEPER_UNIVERSAL_IDENTIFIER,
  name: 'slack-stale-request-sweeper',
  description:
    'Marks Slack Assistant Requests left in Processing by a killed worker run as Failed, and tells the requester in Slack that their question timed out.',
  timeoutSeconds: 60,
  handler: failStaleSlackAssistantRequests,
  cronTriggerSettings: {
    pattern: SLACK_STALE_REQUEST_SWEEPER_CRON_PATTERN,
  },
});
