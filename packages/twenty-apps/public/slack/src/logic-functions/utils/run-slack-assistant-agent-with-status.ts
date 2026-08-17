import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

type RunSlackAssistantAgentInput = Pick<
  RunAgentInput,
  'agentUniversalIdentifier' | 'runAsWorkspaceMemberId'
> & {
  messages: SlackAssistantAgentMessage[];
  slackChannelId: string;
  threadTimestamp: string;
};

export const runSlackAssistantAgentWithStatus = async ({
  agentUniversalIdentifier,
  messages,
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
      messages,
      runAsWorkspaceMemberId,
    });
  } finally {
    await stopStatusUpdates();
  }
};
