import { isUndefined } from '@sniptt/guards';
import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk/define';

import { START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/start-post-install-backfills-logic-function-universal-identifier';
import { requestCallRecordingSummariesBackfill } from 'src/logic-functions/data/request-call-recording-summaries-backfill.util';
import { requestUpcomingCalendarEventsReconciliation } from 'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util';

// An app is allowed a single post-install hook, so the two backfills share it:
// a fresh install seeds the scheduling window, an upgrade relies on the scheduled sweep and backfills summaries.
type StartPostInstallBackfillsResult = {
  calendarEventSweepOutcome: 'sweep-requested' | 'skipped-upgrade';
  summaryBackfillOutcome: 'skipped-initial-install' | 'backfill-requested';
};

export const startPostInstallBackfillsHandler = async ({
  previousVersion,
}: InstallPayload): Promise<StartPostInstallBackfillsResult> => {
  if (isUndefined(previousVersion)) {
    if (!(await requestUpcomingCalendarEventsReconciliation())) {
      throw new Error(
        '[call-recorder] Failed to start post-install backfills: upcoming calendar event sweep',
      );
    }

    return {
      calendarEventSweepOutcome: 'sweep-requested',
      summaryBackfillOutcome: 'skipped-initial-install',
    };
  }

  if (!(await requestCallRecordingSummariesBackfill())) {
    throw new Error(
      '[call-recorder] Failed to start post-install backfills: call recording summary backfill',
    );
  }

  return {
    calendarEventSweepOutcome: 'skipped-upgrade',
    summaryBackfillOutcome: 'backfill-requested',
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
