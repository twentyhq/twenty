import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineUninstallLogicFunction } from 'twenty-sdk/define';

import { CANCEL_RECALL_BOTS_ON_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/cancel-recall-bots-on-uninstall-logic-function-universal-identifier';
import { cancelOpenScheduledCallRecordingRequests } from 'src/logic-functions/data/cancel-open-scheduled-call-recording-requests.util';
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

type UninstallCleanupSummary = CancelWorkspaceRecallBotsResult & {
  canceledCallRecordingRequestCount: number;
};

const cancelOpenCallRecordingRequests = async (): Promise<number> => {
  try {
    const canceledCallRecordingIds =
      await cancelOpenScheduledCallRecordingRequests(new CoreApiClient());

    return canceledCallRecordingIds.length;
  } catch (error) {
    console.warn(
      `[call-recorder] uninstall record cleanup incomplete: failed to cancel open call recording requests: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    return 0;
  }
};

const cancelRecallBotsOnUninstallHandler = async (): Promise<
  UninstallCleanupSummary | StepFailure
> => {
  const deadlineEpochMs =
    Date.now() +
    UNINSTALL_TIMEOUT_SECONDS * 1_000 -
    CANCELLATION_DEADLINE_HEADROOM_MS;

  // Requests flip first so a deadline-truncated bot drain still leaves the
  // records marked canceled instead of waiting on bots that never come.
  const canceledCallRecordingRequestCount =
    await cancelOpenCallRecordingRequests();

  try {
    const botCancellationResult = await cancelWorkspaceRecallBots({
      joinAtAfter: new Date().toISOString(),
      deadlineEpochMs,
    });

    return { canceledCallRecordingRequestCount, ...botCancellationResult };
  } catch (error) {
    return buildStepFailure('uninstall bot cancellation', error);
  }
};

export default defineUninstallLogicFunction({
  universalIdentifier:
    CANCEL_RECALL_BOTS_ON_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cancel-recall-bots-on-uninstall',
  description:
    'Cancels open call recording requests and every upcoming Recall bot of the workspace when the app is uninstalled.',
  timeoutSeconds: UNINSTALL_TIMEOUT_SECONDS,
  handler: cancelRecallBotsOnUninstallHandler,
});
