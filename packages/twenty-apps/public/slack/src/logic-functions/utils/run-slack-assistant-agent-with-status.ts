import { runAgent, type RunAgentResult } from 'twenty-sdk/logic-function';

import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

// Omitting `runAsWorkspaceMemberId` runs the agent with its own role, which is
// what an unlinked Slack account gets.
export const runSlackAssistantAgentWithStatus = async ({
  agentUniversalIdentifier,
  prompt,
  runAsWorkspaceMemberId,
  slackChannelId,
  threadTimestamp,
}: {
  agentUniversalIdentifier: string;
  prompt: string;
  runAsWorkspaceMemberId: string | undefined;
  slackChannelId: string;
  threadTimestamp: string;
}): Promise<RunAgentResult> => {
  const stopStatusUpdates = startSlackAssistantStatusUpdates({
    slackChannelId,
    threadTimestamp,
  });

  try {
    return await runAgent({
      agentUniversalIdentifier,
      prompt,
      runAsWorkspaceMemberId,
    });
  } finally {
    await stopStatusUpdates();
  }
};
