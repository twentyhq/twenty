import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { raceSlackAssistantAgentDeadline } from 'src/logic-functions/utils/race-slack-assistant-agent-deadline';
import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

type RunSlackAssistantAgentInput = Pick<
  RunAgentInput,
  'agentUniversalIdentifier' | 'runAsWorkspaceMemberId'
> & {
  messages: SlackAssistantAgentMessage[];
  slackChannelId: string;
  threadTimestamp: string;
  deadlineAtMs: number;
};

export const runSlackAssistantAgentWithStatus = async ({
  agentUniversalIdentifier,
  messages,
  runAsWorkspaceMemberId,
  slackChannelId,
  threadTimestamp,
  deadlineAtMs,
}: RunSlackAssistantAgentInput): Promise<RunAgentResult> => {
  const stopStatusUpdates = startSlackAssistantStatusUpdates({
    slackChannelId,
    threadTimestamp,
  });

  try {
    return await raceSlackAssistantAgentDeadline({
      agentRun: runAgent({
        agentUniversalIdentifier,
        messages,
        runAsWorkspaceMemberId,
      }),
      deadlineAtMs,
    });
  } finally {
    await stopStatusUpdates();
  }
};
