import {
  runAgent,
  type RunAgentInput,
  type RunAgentResult,
} from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { raceSlackAssistantAgentDeadline } from 'src/logic-functions/utils/race-slack-assistant-agent-deadline';

type RunSlackAssistantAgentInput = Pick<
  RunAgentInput,
  'agentUniversalIdentifier' | 'runAsWorkspaceMemberId'
> & {
  messages: SlackAssistantAgentMessage[];
  deadlineAtMs: number;
};

export const runSlackAssistantAgentWithDeadline = async ({
  agentUniversalIdentifier,
  messages,
  runAsWorkspaceMemberId,
  deadlineAtMs,
}: RunSlackAssistantAgentInput): Promise<RunAgentResult> => {
  if (deadlineAtMs - Date.now() <= 0) {
    return {
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    };
  }

  return await raceSlackAssistantAgentDeadline({
    agentRun: runAgent({
      agentUniversalIdentifier,
      messages,
      runAsWorkspaceMemberId,
    }),
    deadlineAtMs,
  });
};
