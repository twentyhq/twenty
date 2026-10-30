import { isUndefined } from '@sniptt/guards';

import { RECALL_BOT_ALREADY_JOINED_STATUS } from 'src/logic-functions/constants/recall-bot-already-joined-status';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { getClaimedWorkspaceId } from 'src/logic-functions/recall-api/get-claimed-workspace-id.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { listScheduledRecallBotsBeforeRequestCutoff } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

const RECALL_BOT_CANCELLATION_CONCURRENCY = 5;

export type CancelWorkspaceRecallBotsResult = {
  scannedBotCount: number;
  canceledExternalBotIds: string[];
};

const cancelRecallBotsUntilCutoff = async ({
  externalBotIds,
  cancellationCutoffEpochMs,
}: {
  externalBotIds: string[];
  cancellationCutoffEpochMs: number;
}): Promise<{
  canceledExternalBotIds: string[];
  failedExternalBotIds: string[];
  cutoffReached: boolean;
}> => {
  const canceledExternalBotIds: string[] = [];
  const failedExternalBotIds: string[] = [];

  for (const externalBotIdBatch of getBatches(
    externalBotIds,
    RECALL_BOT_CANCELLATION_CONCURRENCY,
  )) {
    if (Date.now() >= cancellationCutoffEpochMs) {
      return {
        canceledExternalBotIds,
        failedExternalBotIds,
        cutoffReached: true,
      };
    }

    const recallBotCancellationResults = await Promise.all(
      externalBotIdBatch.map(async (externalBotId) => ({
        externalBotId,
        result: await cancelRecallBot({ externalBotId }),
      })),
    );

    for (const { externalBotId, result } of recallBotCancellationResults) {
      if (result.ok) {
        canceledExternalBotIds.push(externalBotId);
      } else if (result.status !== RECALL_BOT_ALREADY_JOINED_STATUS) {
        console.warn(
          `[call-recorder] uninstall bot cleanup incomplete: failed to cancel Recall bot ${externalBotId}: ${result.errorMessage}`,
        );
        failedExternalBotIds.push(externalBotId);
      }
    }
  }

  return { canceledExternalBotIds, failedExternalBotIds, cutoffReached: false };
};

export const cancelWorkspaceRecallBots = async ({
  joinAtAfter,
  cancellationCutoffEpochMs,
}: {
  joinAtAfter: string;
  cancellationCutoffEpochMs: number;
}): Promise<CancelWorkspaceRecallBotsResult> => {
  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    throw new Error(
      '[call-recorder] uninstall bot cleanup incomplete: workspace id unavailable',
    );
  }

  const scheduledRecallBotsResult =
    await listScheduledRecallBotsBeforeRequestCutoff({
      joinAtAfter,
      metadata: { twentyWorkspaceId: currentWorkspaceId },
      requestStartCutoffEpochMs: cancellationCutoffEpochMs,
    });

  if (!scheduledRecallBotsResult.ok) {
    throw new Error(
      `[call-recorder] uninstall bot cleanup incomplete: failed to list Recall bots: ${scheduledRecallBotsResult.errorMessage}`,
    );
  }

  const { canceledExternalBotIds, failedExternalBotIds, cutoffReached } =
    await cancelRecallBotsUntilCutoff({
      externalBotIds: scheduledRecallBotsResult.bots.flatMap(
        (scheduledRecallBot) =>
          getClaimedWorkspaceId(scheduledRecallBot) === currentWorkspaceId
            ? [scheduledRecallBot.id]
            : [],
      ),
      cancellationCutoffEpochMs,
    });

  if (
    failedExternalBotIds.length > 0 ||
    cutoffReached ||
    scheduledRecallBotsResult.truncated
  ) {
    throw new Error(
      `[call-recorder] uninstall bot cleanup incomplete: ${canceledExternalBotIds.length} canceled, ${failedExternalBotIds.length} failed, cutoff reached: ${cutoffReached}, list truncated: ${scheduledRecallBotsResult.truncated}`,
    );
  }

  return {
    scannedBotCount: scheduledRecallBotsResult.bots.length,
    canceledExternalBotIds,
  };
};
