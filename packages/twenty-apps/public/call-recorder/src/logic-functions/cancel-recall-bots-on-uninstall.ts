import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineUninstallLogicFunction } from 'twenty-sdk/define';

import { CANCEL_RECALL_BOTS_ON_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RECALL_API_MAX_IN_PROCESS_RETRY_WAIT_MS } from 'src/logic-functions/constants/recall-api-max-in-process-retry-wait-ms';
import { cancelOpenScheduledCallRecordingRequests } from 'src/logic-functions/data/cancel-open-scheduled-call-recording-requests.util';
import { findOpenOrLiveCallRecordings } from 'src/logic-functions/data/find-open-or-live-call-recordings.util';
import {
  cancelWorkspaceRecallBotsOrThrow,
  type CancelWorkspaceRecallBotsResult,
} from 'src/logic-functions/flows/cancel-workspace-recall-bots.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

const UNINSTALL_TIMEOUT_SECONDS = 30;
const RECORD_CLEANUP_REQUEST_START_BUDGET_MS = 5_000;
const UNINSTALL_RESPONSE_HEADROOM_MS = 5_000;
const RECALL_CANCELLATION_START_HEADROOM_MS =
  RECALL_API_MAX_IN_PROCESS_RETRY_WAIT_MS + UNINSTALL_RESPONSE_HEADROOM_MS;

type UninstallCleanupSummary = CancelWorkspaceRecallBotsResult & {
  canceledCallRecordingRequestCount: number;
};

export const cancelRecallBotsOnUninstallHandler =
  async (): Promise<UninstallCleanupSummary> => {
    const coreApiClient = new CoreApiClient();
    const uninstallStartedAt = new Date();
    let canceledCallRecordingRequestCount = 0;
    let knownExternalBotIds: string[] = [];
    let recordCleanupError: Error | undefined;
    const recordCleanupRequestStartCutoffEpochMs =
      uninstallStartedAt.getTime() + RECORD_CLEANUP_REQUEST_START_BUDGET_MS;
    const shouldStartRecordCleanupRequest = () =>
      Date.now() < recordCleanupRequestStartCutoffEpochMs;

    try {
      const openOrLiveCallRecordings = await findOpenOrLiveCallRecordings({
        client: coreApiClient,
        shouldStartPageRequest: shouldStartRecordCleanupRequest,
      });
      const openCallRecordings = openOrLiveCallRecordings.filter(
        (callRecording) =>
          callRecording.status === CallRecordingStatus.SCHEDULED,
      );

      knownExternalBotIds = getUniqueSortedIds(
        openOrLiveCallRecordings.map(
          (callRecording) => callRecording.externalBotId,
        ),
      );

      if (openCallRecordings.length > 0 && !shouldStartRecordCleanupRequest()) {
        recordCleanupError = buildRecordCleanupError(
          'failed to cancel open call recording requests',
          'record cleanup request cutoff reached before updates started',
        );
      } else {
        try {
          canceledCallRecordingRequestCount =
            await cancelOpenScheduledCallRecordingRequests(
              coreApiClient,
              openCallRecordings.map((callRecording) => callRecording.id),
              shouldStartRecordCleanupRequest,
            );
        } catch (error) {
          recordCleanupError = buildRecordCleanupError(
            'failed to cancel open call recording requests',
            error,
          );
        }
      }
    } catch (error) {
      recordCleanupError = buildRecordCleanupError(
        'failed to read open call recording requests',
        error,
      );
    }

    if (recordCleanupError !== undefined) {
      console.warn(
        `[call-recorder] uninstall record cleanup incomplete: ${recordCleanupError.message}`,
      );
    }

    const workspaceRecallBotCancellationResult =
      await cancelWorkspaceRecallBotsOrThrow({
        knownExternalBotIds,
        joinAtAfter: uninstallStartedAt.toISOString(),
        cancellationCutoffEpochMs:
          uninstallStartedAt.getTime() +
          UNINSTALL_TIMEOUT_SECONDS * 1_000 -
          RECALL_CANCELLATION_START_HEADROOM_MS,
      });

    if (recordCleanupError !== undefined) {
      throw recordCleanupError;
    }

    return {
      canceledCallRecordingRequestCount,
      ...workspaceRecallBotCancellationResult,
    };
  };

const buildRecordCleanupError = (message: string, error: unknown): Error =>
  new Error(
    `${message}: ${error instanceof Error ? error.message : String(error)}`,
  );

export default defineUninstallLogicFunction({
  universalIdentifier:
    CANCEL_RECALL_BOTS_ON_UNINSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cancel-recall-bots-on-uninstall',
  description:
    'Cancels open call recording requests and removes the workspace Recall bots, ejecting the ones already in a call, and fails while an upcoming bot is left.',
  timeoutSeconds: UNINSTALL_TIMEOUT_SECONDS,
  handler: cancelRecallBotsOnUninstallHandler,
});
