import { isUndefined } from '@sniptt/guards';
import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk/define';

import { BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/backfill-call-recording-summaries-logic-function-universal-identifier';
import { START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/start-post-install-backfills-logic-function-universal-identifier';
import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/sweep-upcoming-calendar-events-logic-function-universal-identifier';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

// An app is allowed a single post-install hook, so the two backfills share it:
// a fresh install seeds the scheduling window, an upgrade relies on the scheduled sweep and backfills summaries.
type StartPostInstallBackfillsResult = {
  calendarEventSweepOutcome: 'sweep-enqueued' | 'skipped-upgrade';
  summaryBackfillOutcome: 'skipped-initial-install' | 'backfill-enqueued';
};

// The async install hook is redelivered only for retryable failures.
export const startPostInstallBackfillsHandler = async ({
  previousVersion,
}: InstallPayload): Promise<StartPostInstallBackfillsResult> => {
  const isFreshInstall = isUndefined(previousVersion);

  try {
    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier: isFreshInstall
        ? SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER
        : BACKFILL_CALL_RECORDING_SUMMARIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
    });
  } catch (error) {
    throw buildRetryableStepFailure('post-install backfill kickoff', error);
  }

  return isFreshInstall
    ? {
        calendarEventSweepOutcome: 'sweep-enqueued',
        summaryBackfillOutcome: 'skipped-initial-install',
      }
    : {
        calendarEventSweepOutcome: 'skipped-upgrade',
        summaryBackfillOutcome: 'backfill-enqueued',
      };
};

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-post-install-backfills',
  description:
    'Schedules recording bots for upcoming meetings on install, and backfills missing call recording summaries on upgrade.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: startPostInstallBackfillsHandler,
});
