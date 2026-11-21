import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_REQUEST_WATCHDOG_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-watchdog-timeout-seconds';
import { slackAssistantRequestWatchdogHandler } from 'src/logic-functions/handlers/slack-assistant-request-watchdog-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_REQUEST_WATCHDOG_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-request-watchdog',
  description:
    'Enqueued with a delay for every Slack Assistant Request, past the answering function timeout. If the request is still pending or processing with no live execution behind it, marks it failed, clears the thinking status and tells the user to ask again. Never re-runs the agent.',
  timeoutSeconds: SLACK_ASSISTANT_REQUEST_WATCHDOG_TIMEOUT_SECONDS,
  handler: slackAssistantRequestWatchdogHandler,
});
