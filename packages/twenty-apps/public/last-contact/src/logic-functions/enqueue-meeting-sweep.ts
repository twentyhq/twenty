import { defineLogicFunction } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import {
  MEETING_SWEEP_CRON_PATTERN,
  MEETING_SWEEP_DISTRIBUTION_WINDOW_MS,
} from 'src/constants/meeting-schedule';
import { ENQUEUE_MEETING_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { computeWorkspaceDistributionDelay } from 'src/utils/compute-workspace-distribution-delay';
import { enqueueMeetingSweepJob } from 'src/utils/enqueue-meeting-sweep-job';

const handler = async (
  _payload: unknown,
  { workspaceId }: LogicFunctionExecutionContext,
): Promise<void> => {
  await enqueueMeetingSweepJob(
    computeWorkspaceDistributionDelay(
      workspaceId,
      MEETING_SWEEP_DISTRIBUTION_WINDOW_MS,
    ),
  );
};

export default defineLogicFunction({
  universalIdentifier:
    ENQUEUE_MEETING_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'enqueue-meeting-sweep',
  description:
    'Enqueues the daily meeting sweep at a stable workspace-specific delay, so workspaces do not all call the API in the same minute.',
  timeoutSeconds: 30,
  cronTriggerSettings: {
    pattern: MEETING_SWEEP_CRON_PATTERN,
  },
  handler,
});
