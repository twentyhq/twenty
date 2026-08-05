import { isUndefined } from '@sniptt/guards';
import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk/define';

import { START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/start-post-install-backfills-logic-function-universal-identifier';
import { enqueueCallRecordingSummariesBackfill } from 'src/logic-functions/data/enqueue-call-recording-summaries-backfill.util';
import { enqueueUpcomingCalendarEventsSweep } from 'src/logic-functions/data/enqueue-upcoming-calendar-events-sweep.util';

// An app is allowed a single post-install hook, so the two backfills share it:
// a fresh install seeds the scheduling window, an upgrade relies on the scheduled sweep and backfills summaries.
type StartPostInstallBackfillsResult = {
  calendarEventSweepOutcome: 'sweep-enqueued' | 'skipped-upgrade';
  summaryBackfillOutcome: 'skipped-initial-install' | 'backfill-enqueued';
};

export const startPostInstallBackfillsHandler = async ({
  previousVersion,
}: InstallPayload): Promise<StartPostInstallBackfillsResult> => {
  if (isUndefined(previousVersion)) {
    try {
      await enqueueUpcomingCalendarEventsSweep();
    } catch (error) {
      throw Object.assign(
        new Error(
          '[call-recorder] Failed to start post-install backfills: upcoming calendar event sweep',
        ),
        { cause: error },
      );
    }

    return {
      calendarEventSweepOutcome: 'sweep-enqueued',
      summaryBackfillOutcome: 'skipped-initial-install',
    };
  }

  try {
    await enqueueCallRecordingSummariesBackfill();
  } catch (error) {
    throw Object.assign(
      new Error(
        '[call-recorder] Failed to start post-install backfills: call recording summary backfill',
      ),
      { cause: error },
    );
  }

  return {
    calendarEventSweepOutcome: 'skipped-upgrade',
    summaryBackfillOutcome: 'backfill-enqueued',
  };
};

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-post-install-backfills',
  description:
    'Enqueues recording bot scheduling for upcoming meetings on install, and the call recording summary backfill on upgrade.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: startPostInstallBackfillsHandler,
});
