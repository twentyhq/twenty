import { isUndefined } from '@sniptt/guards';
import {
  definePostInstallLogicFunction,
  type InstallPayload,
} from 'twenty-sdk/define';

import { START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/start-post-install-backfills-logic-function-universal-identifier';
import { requestCallRecordingSummariesBackfill } from 'src/logic-functions/data/request-call-recording-summaries-backfill.util';

type StartPostInstallBackfillsResult = {
  summaryBackfillOutcome: 'skipped-initial-install' | 'backfill-requested';
};

export const startPostInstallBackfillsHandler = async ({
  previousVersion,
}: InstallPayload): Promise<StartPostInstallBackfillsResult> => {
  // Missing summaries only exist for recordings made before an upgrade, so a fresh install has nothing to backfill.
  if (isUndefined(previousVersion)) {
    return { summaryBackfillOutcome: 'skipped-initial-install' };
  }

  if (!(await requestCallRecordingSummariesBackfill())) {
    throw new Error(
      '[call-recorder] Failed to start post-install backfills: call recording summary backfill',
    );
  }

  return { summaryBackfillOutcome: 'backfill-requested' };
};

export default definePostInstallLogicFunction({
  universalIdentifier:
    START_POST_INSTALL_BACKFILLS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'start-post-install-backfills',
  description:
    'Generates missing call recording summaries when Call Recorder is upgraded in a workspace.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: startPostInstallBackfillsHandler,
});
