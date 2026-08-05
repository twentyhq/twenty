import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

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
    // The runAgent API accepts messages since SDK 2.28, but the app still
    // installs an older SDK whose input type only knows prompt; widen until
    // the dependency is bumped.
    return await runAgent({
      agentUniversalIdentifier,
      messages,
    } as unknown as RunAgentInput);
  } finally {
    await stopProgressUpdates();
  }
};
