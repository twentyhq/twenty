import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { slackAssistantWorkerHandler } from 'src/logic-functions/handlers/slack-assistant-worker-handler';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { enqueueSlackAssistantRequest } from 'src/logic-functions/utils/enqueue-slack-assistant-request';

export const slackAssistantRequestHandler = async (
  body: SlackEventsRequestBody,
): Promise<object> => {
  const enqueueResult = await enqueueSlackAssistantRequest(body);

  if (!isDefined(enqueueResult.request)) {
    return enqueueResult;
  }

  return await slackAssistantWorkerHandler(enqueueResult.request);
};

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_REQUEST_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-request',
  description:
    'Runs in the resolved workspace: records the Slack message as a Slack Assistant Request, then answers it in the same execution by showing a native thinking status on the conversation thread, running the Slack Assistant agent against the workspace, and posting the answer as a threaded reply.',
  timeoutSeconds: SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS,
  handler: slackAssistantRequestHandler,
});
