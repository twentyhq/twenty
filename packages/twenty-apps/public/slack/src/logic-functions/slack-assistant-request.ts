import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_AGENT_BUDGET_SECONDS } from 'src/logic-functions/constants/slack-assistant-agent-budget-seconds';
import { SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-timeout-seconds';
import { slackAssistantWorkerHandler } from 'src/logic-functions/handlers/slack-assistant-worker-handler';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { enqueueSlackAssistantRequest } from 'src/logic-functions/utils/enqueue-slack-assistant-request';
import { enqueueSlackAssistantRequestWatchdog } from 'src/logic-functions/utils/enqueue-slack-assistant-request-watchdog';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const slackAssistantRequestHandler = async (
  body: SlackEventsRequestBody,
): Promise<object> => {
  const agentDeadlineAtMs =
    Date.now() + SLACK_ASSISTANT_AGENT_BUDGET_SECONDS * 1000;

  const enqueueResult = await enqueueSlackAssistantRequest(body);

  if (!isDefined(enqueueResult.request)) {
    return enqueueResult;
  }

  const { request } = enqueueResult;

  const isWatchdogScheduled = await enqueueSlackAssistantRequestWatchdog({
    slackAssistantRequestId: request.id,
  }).then(
    () => true,
    (error: unknown) => {
      console.error(
        `[slack] could not schedule the watchdog for request ${request.id}: ${toErrorMessage(error)}`,
      );

      return false;
    },
  );

  const answerResult = await slackAssistantWorkerHandler(request, {
    agentDeadlineAtMs,
  });

  return { ...answerResult, isWatchdogScheduled };
};

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_REQUEST_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-request',
  description:
    'Runs in the resolved workspace: records the Slack message as a Slack Assistant Request, then answers it in the same execution by showing a native thinking status on the conversation thread, running the Slack Assistant agent against the workspace, and posting the answer as a threaded reply.',
  timeoutSeconds: SLACK_ASSISTANT_REQUEST_TIMEOUT_SECONDS,
  handler: slackAssistantRequestHandler,
});
