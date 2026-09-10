import { type RunAgentResult } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { runWithTimeout } from 'src/logic-functions/utils/run-with-timeout';

export const raceSlackAssistantAgentDeadline = async ({
  agentRun,
  deadlineAtMs,
}: {
  agentRun: Promise<RunAgentResult>;
  deadlineAtMs: number;
}): Promise<RunAgentResult> =>
  await runWithTimeout({
    operation: agentRun,
    timeoutMs: Math.max(deadlineAtMs - Date.now(), 0),
    buildTimeoutValue: () => ({
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    }),
  });
