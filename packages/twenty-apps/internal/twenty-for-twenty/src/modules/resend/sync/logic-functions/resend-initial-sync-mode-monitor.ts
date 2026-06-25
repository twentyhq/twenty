import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RESEND_INITIAL_SYNC_MODE_MONITOR_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import { areAllSyncCursorsEmpty } from '@modules/resend/sync/utils/are-all-sync-cursors-empty';
import {
  isInitialSyncModeOn,
  setInitialSyncMode,
} from '@modules/resend/sync/utils/set-initial-sync-mode';

type ResendInitialSyncModeMonitorSummary = {
  skipped: boolean;
  flipped: boolean;
};

export const resendInitialSyncModeMonitorHandler =
  async (): Promise<ResendInitialSyncModeMonitorSummary> => {
    if (!(await isInitialSyncModeOn())) {
      console.log(
        '[resend-initial-sync-mode-monitor] INITIAL_SYNC_MODE is off - nothing to do',
      );

      return { skipped: true, flipped: false };
    }

    const coreApiClient = new CoreApiClient();

    const allCursorsCleared = await areAllSyncCursorsEmpty(coreApiClient);

    if (!allCursorsCleared) {
      console.log(
        '[resend-initial-sync-mode-monitor] some sync cursors are still in progress; not flipping yet',
      );

      return { skipped: false, flipped: false };
    }

    await setInitialSyncMode('false');

    console.log(
      '[resend-initial-sync-mode-monitor] all sync cursors are empty - INITIAL_SYNC_MODE flipped to false',
    );

    return { skipped: false, flipped: true };
  };

export default defineLogicFunction({
  universalIdentifier:
    RESEND_INITIAL_SYNC_MODE_MONITOR_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'resend-initial-sync-mode-monitor',
  description:
    'When INITIAL_SYNC_MODE is on, watches the Resend sync cursors and flips it to false once every step has cleared its cursor.',
  timeoutSeconds: 30,
  handler: resendInitialSyncModeMonitorHandler,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
});
