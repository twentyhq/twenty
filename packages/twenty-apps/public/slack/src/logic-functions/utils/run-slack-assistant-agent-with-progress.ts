import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { startSlackAssistantProgressUpdates } from 'src/logic-functions/utils/start-slack-assistant-progress-updates';

export const runSlackAssistantAgentWithProgress = async ({
  agentUniversalIdentifier,
  prompt,
  slackChannelId,
  placeholderTimestamp,
}: RunAgentInput & {
  slackChannelId: string;
  placeholderTimestamp: string;
}): Promise<RunAgentResult> => {
  const stopProgressUpdates = startSlackAssistantProgressUpdates({
    slackChannelId,
    placeholderTimestamp,
  });

  try {
    return await runAgent({ agentUniversalIdentifier, prompt });
  } finally {
    await stopProgressUpdates();
  }
};
