import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

// `prompt` is declared rather than picked: `RunAgentInput` is a XOR between
// `prompt` and `messages`, so picking it through widens it to optional.
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
