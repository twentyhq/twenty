import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { START_FIREFLIES_BACKFILL_ON_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FirefliesBackfillKickoffOutcome } from 'src/logic-functions/constants/fireflies-backfill-kickoff-outcome';
import { getFirefliesBackfillDays } from 'src/logic-functions/utils/get-fireflies-backfill-days';
import { requestFirefliesBackfill } from 'src/logic-functions/utils/request-fireflies-backfill';

type Outcomes = typeof FirefliesBackfillKickoffOutcome;

// Kickoff failures are represented by the throw below — the hook runs async
// through the message queue with a retry limit, so throwing gets the kickoff
// retried instead of silently reporting a green run.
type StartFirefliesBackfillOnInstallResult = {
  backfillOutcome: Outcomes['BACKFILL_REQUESTED'] | Outcomes['SKIPPED_DISABLED'];
};

export const startFirefliesBackfillOnInstallHandler =
  async (): Promise<StartFirefliesBackfillOnInstallResult> => {
    if (getFirefliesBackfillDays() <= 0) {
      return {
        backfillOutcome: FirefliesBackfillKickoffOutcome.SKIPPED_DISABLED,
      };
    }

    const backfillRequested = await requestFirefliesBackfill();

    if (!backfillRequested) {
      throw new Error(
        '[twenty-fireflies] Failed to start the Fireflies history backfill: the kickoff request to the backfill route did not fire',
      );
    }

    return {
      backfillOutcome: FirefliesBackfillKickoffOutcome.BACKFILL_REQUESTED,
    };
  };

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_FIREFLIES_BACKFILL_ON_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-fireflies-backfill-on-install',
  description:
    'Starts the Fireflies history backfill when the app is installed or upgraded in a workspace, so calls recorded before the installation (or stored on the removed 0.1.x CalendarEvent fields) are re-ingested as CallRecording records.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: startFirefliesBackfillOnInstallHandler,
});
