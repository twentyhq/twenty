import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

// `prompt` is declared here rather than picked, because `RunAgentInput` is a XOR
// between `prompt` and `messages` and picking through it widens the field to
// `string | undefined`. The assistant only ever sends a prompt.
type RunSlackAssistantAgentInput = Pick<
  RunAgentInput,
  'agentUniversalIdentifier' | 'runAsWorkspaceMemberId'
> & {
  prompt: string;
  slackChannelId: string;
  threadTimestamp: string;
};

// Omitting `runAsWorkspaceMemberId` runs the agent with its own role, which is
// what an unlinked Slack account gets.
export const runSlackAssistantAgentWithStatus = async ({
  agentUniversalIdentifier,
  prompt,
  runAsWorkspaceMemberId,
  slackChannelId,
  threadTimestamp,
}: RunSlackAssistantAgentInput): Promise<RunAgentResult> => {
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
