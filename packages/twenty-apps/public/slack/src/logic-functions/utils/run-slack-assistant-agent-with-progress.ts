import { runAgent, type RunAgentResult } from 'twenty-sdk/logic-function';

import { startSlackAssistantProgressUpdates } from 'src/logic-functions/utils/start-slack-assistant-progress-updates';

// Omitting `runAsWorkspaceMemberId` runs the agent with its own role, which is
// what an unmapped Slack account gets.
export const runSlackAssistantAgentWithProgress = async ({
  agentUniversalIdentifier,
  prompt,
  runAsWorkspaceMemberId,
  slackChannelId,
  placeholderTimestamp,
}: {
  agentUniversalIdentifier: string;
  prompt: string;
  runAsWorkspaceMemberId: string | undefined;
  slackChannelId: string;
  placeholderTimestamp: string;
}): Promise<RunAgentResult> => {
  const stopProgressUpdates = startSlackAssistantProgressUpdates({
    slackChannelId,
    placeholderTimestamp,
  });

  try {
    return await runAgent({
      agentUniversalIdentifier,
      prompt,
      runAsWorkspaceMemberId,
    });
  } finally {
    await stopProgressUpdates();
  }
};
