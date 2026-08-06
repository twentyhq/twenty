import { defineUninstallLogicFunction } from 'twenty-sdk/define';

import { CANCEL_RECALL_BOTS_ON_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/cancel-recall-bots-on-uninstall-logic-function-universal-identifier';
import {
  cancelWorkspaceRecallBots,
  type CancelWorkspaceRecallBotsResult,
} from 'src/logic-functions/flows/cancel-workspace-recall-bots.util';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

const UNINSTALL_TIMEOUT_SECONDS = 250;
// Best-effort headroom for an in-flight Recall request and returning the summary.
const CANCELLATION_DEADLINE_HEADROOM_MS = 20_000;

const cancelRecallBotsOnUninstallHandler = async (): Promise<
  CancelWorkspaceRecallBotsResult | StepFailure
> => {
  try {
    return await cancelWorkspaceRecallBots({
      joinAtAfter: new Date().toISOString(),
      deadlineEpochMs:
        Date.now() +
        UNINSTALL_TIMEOUT_SECONDS * 1_000 -
        CANCELLATION_DEADLINE_HEADROOM_MS,
    });
  } catch (error) {
    return buildStepFailure('uninstall bot cancellation', error);
  }
};

export default defineUninstallLogicFunction({
  universalIdentifier:
    CANCEL_RECALL_BOTS_ON_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cancel-recall-bots-on-uninstall',
  description:
    'Cancels every upcoming Recall bot of the workspace when the app is uninstalled.',
  timeoutSeconds: UNINSTALL_TIMEOUT_SECONDS,
  handler: cancelRecallBotsOnUninstallHandler,
});
