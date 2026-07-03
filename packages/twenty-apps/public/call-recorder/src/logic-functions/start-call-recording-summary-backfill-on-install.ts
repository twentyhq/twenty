import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk/define';

import { START_CALL_RECORDING_SUMMARY_BACKFILL_ON_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/start-call-recording-summary-backfill-on-install-logic-function-universal-identifier';
import { requestCallRecordingSummariesBackfill } from 'src/logic-functions/data/request-call-recording-summaries-backfill.util';

export const startCallRecordingSummaryBackfillOnInstallHandler = async ({
  previousVersion,
}: InstallPayload): Promise<object> => {
  if (previousVersion === undefined) {
    return { outcome: 'skipped-initial-install' };
  }

  const backfillRequested = await requestCallRecordingSummariesBackfill();

  return {
    outcome: backfillRequested
      ? 'backfill-requested'
      : 'backfill-request-failed',
  };
};

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_CALL_RECORDING_SUMMARY_BACKFILL_ON_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-call-recording-summary-backfill-on-install',
  description:
    'Starts the missing summary backfill worker when Call Recorder is upgraded in a workspace.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: startCallRecordingSummaryBackfillOnInstallHandler,
});
