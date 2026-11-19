import { isUndefined } from '@sniptt/guards';

import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { getClaimedWorkspaceId } from 'src/logic-functions/recall-api/get-claimed-workspace-id.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { listScheduledRecallBotsBeforeRequestCutoff } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

const RECALL_BOT_CANCELLATION_CONCURRENCY = 5;
const RECALL_BOT_LIST_CANCELLATION_RESERVE_MS = 5_000;

export type CancelWorkspaceRecallBotsResult = {
  scannedBotCount: number;
  canceledExternalBotIds: string[];
};

export const cancelWorkspaceRecallBotsOrThrow = async ({
  knownExternalBotIds,
  joinAtAfter,
  cancellationCutoffEpochMs,
}: {
  knownExternalBotIds: string[];
  joinAtAfter: string;
  cancellationCutoffEpochMs: number;
}): Promise<CancelWorkspaceRecallBotsResult> => {
  const attemptedCancellationExternalBotIds = new Set<string>();
  const canceledExternalBotIds: string[] = [];
  const failedExternalBotIds: string[] = [];

  const buildIncompleteCleanupError = (reason: string): Error =>
    new Error(
      `[call-recorder] uninstall bot cleanup incomplete: ${reason} (${canceledExternalBotIds.length} canceled, ${failedExternalBotIds.length} failed)`,
    );

  const cancelBotsUntilCutoff = async (
    externalBotIds: string[],
  ): Promise<boolean> => {
    const unattemptedExternalBotIds = [...new Set(externalBotIds)].filter(
      (externalBotId) =>
        !attemptedCancellationExternalBotIds.has(externalBotId),
    );

    if (unattemptedExternalBotIds.length === 0) {
      return Date.now() >= cancellationCutoffEpochMs;
    }

    for (
      let batchStartIndex = 0;
      batchStartIndex < unattemptedExternalBotIds.length;
      batchStartIndex += RECALL_BOT_CANCELLATION_CONCURRENCY
    ) {
      if (Date.now() >= cancellationCutoffEpochMs) {
        return true;
      }

      const externalBotIdBatch = unattemptedExternalBotIds.slice(
        batchStartIndex,
        batchStartIndex + RECALL_BOT_CANCELLATION_CONCURRENCY,
      );

      externalBotIdBatch.forEach((externalBotId) =>
        attemptedCancellationExternalBotIds.add(externalBotId),
      );

      const recallBotRemovalResults = await Promise.all(
        externalBotIdBatch.map(async (externalBotId) => ({
          externalBotId,
          isRemoved: await cancelOrEjectRecallBot(externalBotId),
        })),
      );

      for (const { externalBotId, isRemoved } of recallBotRemovalResults) {
        if (isRemoved) {
          canceledExternalBotIds.push(externalBotId);
        } else {
          failedExternalBotIds.push(externalBotId);
        }
      }
    }

    return false;
  };

  if (await cancelBotsUntilCutoff(knownExternalBotIds)) {
    throw buildIncompleteCleanupError(
      'cancellation cutoff reached before Recall safety scan',
    );
  }

  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    throw buildIncompleteCleanupError(
      'workspace id unavailable for Recall safety scan',
    );
  }

  const scheduledRecallBotsResult =
    await listScheduledRecallBotsBeforeRequestCutoff({
      joinAtAfter,
      metadata: { twentyWorkspaceId: currentWorkspaceId },
      requestStartCutoffEpochMs:
        cancellationCutoffEpochMs - RECALL_BOT_LIST_CANCELLATION_RESERVE_MS,
    });

  if (!scheduledRecallBotsResult.ok) {
    throw buildIncompleteCleanupError(
      `failed to list Recall bots: ${scheduledRecallBotsResult.errorMessage}`,
    );
  }

  const upcomingExternalBotIds = scheduledRecallBotsResult.bots.flatMap(
    (scheduledRecallBot) =>
      getClaimedWorkspaceId(scheduledRecallBot) === currentWorkspaceId
        ? [scheduledRecallBot.id]
        : [],
  );

  if (await cancelBotsUntilCutoff(upcomingExternalBotIds)) {
    throw buildIncompleteCleanupError('cancellation cutoff reached');
  }

  if (scheduledRecallBotsResult.truncated) {
    throw buildIncompleteCleanupError('Recall safety scan was truncated');
  }

  const failedExternalBotIdSet = new Set(failedExternalBotIds);

  if (
    upcomingExternalBotIds.some((externalBotId) =>
      failedExternalBotIdSet.has(externalBotId),
    )
  ) {
    throw buildIncompleteCleanupError('upcoming Recall bots are left');
  }

  return {
    scannedBotCount: scheduledRecallBotsResult.bots.length,
    canceledExternalBotIds,
  };
};
