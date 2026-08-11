import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

type RunSlackAssistantAgentInput = Pick<
  RunAgentInput,
  'agentUniversalIdentifier' | 'runAsWorkspaceMemberId'
> & {
  prompt: string;
  slackChannelId: string;
  threadTimestamp: string;
};

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
