import { type RunAgentResult } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { racePromiseAgainstTimeout } from 'src/logic-functions/utils/race-promise-against-timeout';

export const raceSlackAssistantAgentDeadline = async ({
  agentRun,
  deadlineAtMs,
}: {
  agentRun: Promise<RunAgentResult>;
  deadlineAtMs: number;
}): Promise<RunAgentResult> =>
  racePromiseAgainstTimeout({
    promise: agentRun,
    timeoutMs: deadlineAtMs - Date.now(),
    timedOutResult: {
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    },
  });
