import { runAgent, type RunAgentResult } from 'twenty-sdk/logic-function';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { startSlackAssistantProgressUpdates } from 'src/logic-functions/utils/start-slack-assistant-progress-updates';

export const runSlackAssistantAgentWithProgress = async ({
  agentUniversalIdentifier,
  messages,
  slackChannelId,
  placeholderTimestamp,
}: {
  agentUniversalIdentifier: string;
  messages: SlackAssistantAgentMessage[];
  slackChannelId: string;
  placeholderTimestamp: string;
}): Promise<RunAgentResult> => {
  const stopProgressUpdates = startSlackAssistantProgressUpdates({
    slackChannelId,
    placeholderTimestamp,
  });

  try {
    return await runAgent({ agentUniversalIdentifier, messages });
  } finally {
    await stopProgressUpdates();
  }
};
