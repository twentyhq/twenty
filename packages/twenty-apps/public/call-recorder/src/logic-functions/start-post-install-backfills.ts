import { isUndefined } from '@sniptt/guards';
import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk/define';

import { START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/start-post-install-backfills-logic-function-universal-identifier';
import { requestCallRecordingSummariesBackfill } from 'src/logic-functions/data/request-call-recording-summaries-backfill.util';
import { requestUpcomingCalendarEventsReconciliation } from 'src/logic-functions/data/request-upcoming-calendar-events-reconciliation.util';

type StartPostInstallBackfillsResult = {
  calendarEventSweepOutcome: 'sweep-requested' | 'sweep-request-failed';
  summaryBackfillOutcome:
    | 'skipped-initial-install'
    | 'backfill-requested'
    | 'backfill-request-failed';
};

const logInfo = (message: string) => {
  if (process.env.NODE_ENV !== 'test') {
    console.info(message);
  }
};

export const startPostInstallBackfillsHandler = async ({
  previousVersion,
}: InstallPayload): Promise<StartPostInstallBackfillsResult> => {
  logInfo(
    `[call-recorder] starting post-install backfills for ${isUndefined(previousVersion) ? 'fresh install' : `upgrade from ${previousVersion}`}`,
  );

  const calendarEventSweepRequested =
    await requestUpcomingCalendarEventsReconciliation();

  const summaryBackfillOutcome = isUndefined(previousVersion)
    ? 'skipped-initial-install'
    : (await requestCallRecordingSummariesBackfill())
      ? 'backfill-requested'
      : 'backfill-request-failed';

  const failedKickoffs = [
    ...(calendarEventSweepRequested ? [] : ['upcoming calendar event sweep']),
    ...(summaryBackfillOutcome === 'backfill-request-failed'
      ? ['call recording summary backfill']
      : []),
  ];

  if (failedKickoffs.length > 0) {
    throw new Error(
      `[call-recorder] Failed to start post-install backfills: ${failedKickoffs.join(
        ', ',
      )}`,
    );
  }

  logInfo(
    `[call-recorder] post-install backfill kickoff completed: calendarEventSweepOutcome=${
      calendarEventSweepRequested ? 'sweep-requested' : 'sweep-request-failed'
    }, summaryBackfillOutcome=${summaryBackfillOutcome}`,
  );

  return {
    calendarEventSweepOutcome: calendarEventSweepRequested
      ? 'sweep-requested'
      : 'sweep-request-failed',
    summaryBackfillOutcome,
  };
};

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-post-install-backfills',
  description:
    'Starts backfill workers when Call Recorder is installed or upgraded in a workspace: sweeps upcoming calendar events so meetings created before installation get recording bots, and (on upgrades) generates missing call recording summaries.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: startPostInstallBackfillsHandler,
});
