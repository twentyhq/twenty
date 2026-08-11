import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

export const runSlackAssistantAgentWithStatus = async ({
  agentUniversalIdentifier,
  prompt,
  slackChannelId,
  threadTimestamp,
}: RunAgentInput & {
  slackChannelId: string;
  threadTimestamp: string;
}): Promise<RunAgentResult> => {
  const stopStatusUpdates = startSlackAssistantStatusUpdates({
    slackChannelId,
    threadTimestamp,
  });

  try {
    return await runAgent({ agentUniversalIdentifier, prompt });
  } finally {
    await stopStatusUpdates();
  }
};
