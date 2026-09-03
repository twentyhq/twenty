import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
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
  if (deadlineAtMs - Date.now() <= 0) {
    return {
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    };
  }

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
