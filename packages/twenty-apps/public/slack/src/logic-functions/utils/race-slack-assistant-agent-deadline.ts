import { type RunAgentResult } from 'twenty-sdk/logic-function';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';

export const raceSlackAssistantAgentDeadline = async ({
  agentRun,
  deadlineAtMs,
}: {
  agentRun: Promise<RunAgentResult>;
  deadlineAtMs: number;
}): Promise<RunAgentResult> => {
  let deadlineTimer: ReturnType<typeof setTimeout> | undefined;

  const deadlineResult = new Promise<RunAgentResult>((resolve) => {
    deadlineTimer = setTimeout(
      () =>
        resolve({
          result: null,
          error: SLACK_ASSISTANT_DEADLINE_ERROR,
          success: false,
        }),
      Math.max(deadlineAtMs - Date.now(), 0),
    );
  });

  try {
    return await Promise.race([agentRun, deadlineResult]);
  } finally {
    clearTimeout(deadlineTimer);
  }
};
