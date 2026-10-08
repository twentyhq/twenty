import { isUndefined } from '@sniptt/guards';

import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { getClaimedWorkspaceId } from 'src/logic-functions/recall-api/get-claimed-workspace-id.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { listScheduledRecallBotsBeforeRequestCutoff } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

const RECALL_BOT_CANCELLATION_CONCURRENCY = 5;

export type CancelWorkspaceRecallBotsResult = {
  scannedBotCount: number;
  canceledExternalBotIds: string[];
  failedExternalBotIds: string[];
  truncatedBotList: boolean;
  cutoffReached: boolean;
};

export const cancelWorkspaceRecallBots = async ({
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
  let cutoffReached = false;

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

      const recallBotCancellationResults = await Promise.all(
        externalBotIdBatch.map(async (externalBotId) => ({
          externalBotId,
          result: await cancelRecallBot({ externalBotId }),
        })),
      );

      for (const recallBotCancellationResult of recallBotCancellationResults) {
        if (recallBotCancellationResult.result.ok) {
          canceledExternalBotIds.push(
            recallBotCancellationResult.externalBotId,
          );
        } else {
          console.warn(
            `[call-recorder] uninstall bot cleanup incomplete: failed to cancel Recall bot ${recallBotCancellationResult.externalBotId}: ${recallBotCancellationResult.result.errorMessage}`,
          );
          failedExternalBotIds.push(recallBotCancellationResult.externalBotId);
        }
      }
    }

    return false;
  };

  cutoffReached = await cancelBotsUntilCutoff(knownExternalBotIds);

  if (cutoffReached) {
    console.warn(
      '[call-recorder] uninstall bot cleanup incomplete: cancellation cutoff reached before Recall safety scan',
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds,
      failedExternalBotIds,
      truncatedBotList: false,
      cutoffReached: true,
    };
  }

  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    console.warn(
      '[call-recorder] uninstall bot cleanup incomplete: workspace id unavailable for Recall safety scan',
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds,
      failedExternalBotIds,
      truncatedBotList: false,
      cutoffReached: false,
    };
  }

  if (Date.now() >= cancellationCutoffEpochMs) {
    console.warn(
      '[call-recorder] uninstall bot cleanup incomplete: cancellation cutoff reached before Recall safety scan',
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds,
      failedExternalBotIds,
      truncatedBotList: false,
      cutoffReached: true,
    };
  }

  const scheduledRecallBotsResult =
    await listScheduledRecallBotsBeforeRequestCutoff({
      joinAtAfter,
      metadata: { twentyWorkspaceId: currentWorkspaceId },
      statuses: ['ready'],
      requestStartCutoffEpochMs: cancellationCutoffEpochMs,
    });

  if (!scheduledRecallBotsResult.ok) {
    console.warn(
      `[call-recorder] uninstall bot cleanup incomplete: failed to list Recall bots: ${scheduledRecallBotsResult.errorMessage}`,
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds,
      failedExternalBotIds,
      truncatedBotList: false,
      cutoffReached: false,
    };
  }

  cutoffReached = await cancelBotsUntilCutoff(
    scheduledRecallBotsResult.bots.flatMap((scheduledRecallBot) =>
      getClaimedWorkspaceId(scheduledRecallBot) === currentWorkspaceId
        ? [scheduledRecallBot.id]
        : [],
    ),
  );

  if (cutoffReached) {
    console.warn(
      '[call-recorder] uninstall bot cleanup incomplete: cancellation cutoff reached',
    );
  }

  if (scheduledRecallBotsResult.truncated) {
    console.warn(
      '[call-recorder] uninstall bot cleanup incomplete: Recall safety scan was truncated',
    );
  }

  return {
    scannedBotCount: scheduledRecallBotsResult.bots.length,
    canceledExternalBotIds,
    failedExternalBotIds,
    truncatedBotList: scheduledRecallBotsResult.truncated,
    cutoffReached,
  };
};
