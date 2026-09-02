import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import {
  START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

type StartPostInstallBackfillsResult = {
  calendarEventSweepOutcome: 'sweep-enqueued';
};

// The async install hook is redelivered only for retryable failures.
export const startPostInstallBackfillsHandler =
  async (): Promise<StartPostInstallBackfillsResult> => {
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
  };

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-post-install-backfills',
  description:
    'Schedules recording bots for upcoming meetings when the app is installed.',
  timeoutSeconds: 30,
  handler: startPostInstallBackfillsHandler,
});
