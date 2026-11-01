import { runAgent, type RunAgentInput } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_DEADLINE_RUN_RESULT } from 'src/logic-functions/constants/slack-assistant-deadline-run-result';
import { type SlackAssistantAgentMessage } from 'src/logic-functions/types/slack-assistant-agent-message.type';
import { type SlackAssistantAgentRunResult } from 'src/logic-functions/types/slack-assistant-agent-run-result.type';
import { raceSlackAssistantAgentDeadline } from 'src/logic-functions/utils/race-slack-assistant-agent-deadline';

type RunSlackAssistantAgentInput = Pick<
  RunAgentInput,
  'agentUniversalIdentifier'
> & {
  runAsWorkspaceMemberId: string;
  messages: SlackAssistantAgentMessage[];
  thread: NonNullable<RunAgentInput['thread']>;
  deadlineAtMs: number;
};

export const runSlackAssistantAgentWithDeadline = async ({
  agentUniversalIdentifier,
  messages,
  runAsWorkspaceMemberId,
  thread,
  deadlineAtMs,
}: RunSlackAssistantAgentInput): Promise<SlackAssistantAgentRunResult> => {
  if (deadlineAtMs - Date.now() <= 0) {
    return SLACK_ASSISTANT_DEADLINE_RUN_RESULT;
  }

  return await raceSlackAssistantAgentDeadline({
    agentRun: runAgent({
      agentUniversalIdentifier,
      messages,
      runAsWorkspaceMemberId,
      thread,
    }),
    deadlineAtMs,
  });
};
