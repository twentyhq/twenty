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
  thread: { key: string; title?: string };
  deadlineAtMs: number;
};

export const runSlackAssistantAgentWithDeadline = async ({
  agentUniversalIdentifier,
  messages,
  runAsWorkspaceMemberId,
  thread,
  deadlineAtMs,
}: RunSlackAssistantAgentInput): Promise<RunAgentResult> => {
  if (deadlineAtMs - Date.now() <= 0) {
    return {
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    };
  }

  const input: RunAgentInput & Pick<RunSlackAssistantAgentInput, 'thread'> = {
    agentUniversalIdentifier,
    messages,
    runAsWorkspaceMemberId,
    thread,
  };

  return await raceSlackAssistantAgentDeadline({
    agentRun: runAgent(input),
    deadlineAtMs,
  });
};
