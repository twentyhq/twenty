import { type RunAgentResult } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_DEADLINE_RUN_RESULT } from 'src/logic-functions/constants/slack-assistant-deadline-run-result';
import { type SlackAssistantAgentRunResult } from 'src/logic-functions/types/slack-assistant-agent-run-result.type';
import { runWithTimeout } from 'src/logic-functions/utils/run-with-timeout';

export const raceSlackAssistantAgentDeadline = async ({
  agentRun,
  deadlineAtMs,
}: {
  agentRun: Promise<RunAgentResult>;
  deadlineAtMs: number;
}): Promise<SlackAssistantAgentRunResult> =>
  await runWithTimeout<SlackAssistantAgentRunResult>({
    operation: agentRun,
    timeoutMs: Math.max(deadlineAtMs - Date.now(), 0),
    buildTimeoutValue: () => SLACK_ASSISTANT_DEADLINE_RUN_RESULT,
  });
