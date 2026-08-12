import { runAgent, type RunAgentResult } from 'twenty-sdk/logic-function';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

export const runSlackAssistantAgentWithStatus = async ({
  agentUniversalIdentifier,
  messages,
  slackChannelId,
  threadTimestamp,
}: {
  agentUniversalIdentifier: string;
  messages: SlackAssistantAgentMessage[];
  slackChannelId: string;
  threadTimestamp: string;
}): Promise<RunAgentResult> => {
  const stopStatusUpdates = startSlackAssistantStatusUpdates({
    slackChannelId,
    threadTimestamp,
  });

  try {
    return await runAgent({ agentUniversalIdentifier, messages });
  } finally {
    await stopStatusUpdates();
  }
};
