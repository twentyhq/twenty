import { isUndefined } from '@sniptt/guards';
import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk/define';

import {
  PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { enqueueWorkspaceDistributedJob } from 'src/logic-functions/data/enqueue-workspace-distributed-job.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

type StartPostInstallBackfillsResult =
  | { calendarEventSweepOutcome: 'sweep-enqueued' }
  | { stuckRequestFollowUpDelayMs: number };

// The async install hook is redelivered only for retryable failures.
export const startPostInstallBackfillsHandler = async ({
  previousVersion,
}: InstallPayload): Promise<StartPostInstallBackfillsResult> => {
  if (isUndefined(previousVersion)) {
    try {
      await enqueueLogicFunctionJobs({
        logicFunctionUniversalIdentifier:
          SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payloads: [{}],
      });
    } catch (error) {
      throw buildRetryableStepFailure('post-install sweep kickoff', error);
    }

    return { calendarEventSweepOutcome: 'sweep-enqueued' };
  }

  // Requests that got stuck under an earlier version never had a follow-up.
  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    throw new Error('workspace id unavailable');
  }

  const { delayMs } = await enqueueWorkspaceDistributedJob({
    workspaceId,
    logicFunctionUniversalIdentifier:
      PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    stepLabel: 'post-upgrade stuck request follow-up kickoff',
  });

  return { stuckRequestFollowUpDelayMs: delayMs };
};

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-post-install-backfills',
  description:
    'Schedules recording bots for upcoming meetings when the app is installed, and follows up on requests left stuck by an earlier version when it is upgraded.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: startPostInstallBackfillsHandler,
});
