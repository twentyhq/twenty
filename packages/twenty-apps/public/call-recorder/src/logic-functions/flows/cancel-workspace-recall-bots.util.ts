import { isUndefined } from '@sniptt/guards';

import { RECALL_BOT_ALREADY_JOINED_STATUS } from 'src/logic-functions/constants/recall-bot-already-joined-status';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { ejectRecallBot } from 'src/logic-functions/recall-api/eject-recall-bot.util';
import { getClaimedWorkspaceId } from 'src/logic-functions/recall-api/get-claimed-workspace-id.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { hasRecallBotEnded } from 'src/logic-functions/recall-api/has-recall-bot-ended.util';
import { listScheduledRecallBotsBeforeRequestCutoff } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { type RecallBotRemovalResult } from 'src/logic-functions/types/recall-bot-operation-result.type';

const RECALL_BOT_CANCELLATION_CONCURRENCY = 5;
const RECALL_BOT_LIST_CANCELLATION_RESERVE_MS = 5_000;

export type CancelWorkspaceRecallBotsResult = {
  scannedBotCount: number;
  canceledExternalBotIds: string[];
};

// Unlike cancelOrEjectRecallBot, ejects only after a 405 so a bot never spends two retry windows of the uninstall headroom.
const cancelOrEjectJoinedRecallBot = async (
  externalBotId: string,
): Promise<RecallBotRemovalResult> => {
  const cancelResult = await cancelRecallBot({ externalBotId });

  if (
    cancelResult.ok ||
    cancelResult.status !== RECALL_BOT_ALREADY_JOINED_STATUS
  ) {
    return cancelResult;
  }

  return ejectRecallBot({ externalBotId });
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

      const recallBotCancellationResults = await Promise.all(
        externalBotIdBatch.map(async (externalBotId) => ({
          externalBotId,
          result: await cancelOrEjectJoinedRecallBot(externalBotId),
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

  const isCutoffReached = await cancelBotsUntilCutoff(
    scheduledRecallBotsResult.bots.flatMap((scheduledRecallBot) =>
      getClaimedWorkspaceId(scheduledRecallBot) === currentWorkspaceId &&
      !hasRecallBotEnded(scheduledRecallBot)
        ? [scheduledRecallBot.id]
        : [],
    ),
  );

  if (isCutoffReached) {
    throw buildIncompleteCleanupError('cancellation cutoff reached');
  }

  if (scheduledRecallBotsResult.truncated) {
    throw buildIncompleteCleanupError('Recall safety scan was truncated');
  }

  if (failedExternalBotIds.length > 0) {
    throw buildIncompleteCleanupError('some Recall bots could not be removed');
  }

  return {
    scannedBotCount: scheduledRecallBotsResult.bots.length,
    canceledExternalBotIds,
  };
};
