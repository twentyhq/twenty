import { isUndefined } from '@sniptt/guards';

import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { getClaimedWorkspaceId } from 'src/logic-functions/recall-api/get-claimed-workspace-id.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { listScheduledRecallBotsBeforeRequestCutoff } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

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

  const cancelBotOncePerCleanup = async (externalBotId: string) => {
    if (attemptedCancellationExternalBotIds.has(externalBotId)) {
      return;
    }

    attemptedCancellationExternalBotIds.add(externalBotId);
    const recallBotCancellationResult = await cancelRecallBot({
      externalBotId,
    });

    if (recallBotCancellationResult.ok) {
      canceledExternalBotIds.push(externalBotId);
    } else {
      console.warn(
        `[call-recorder] uninstall bot cleanup incomplete: failed to cancel Recall bot ${externalBotId}: ${recallBotCancellationResult.errorMessage}`,
      );
      failedExternalBotIds.push(externalBotId);
    }
  };

  for (const externalBotId of knownExternalBotIds) {
    if (Date.now() >= cancellationCutoffEpochMs) {
      cutoffReached = true;

      break;
    }

    await cancelBotOncePerCleanup(externalBotId);
  }

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

  if (Date.now() >= cancellationCutoffEpochMs) {
    cutoffReached = true;
  }

  for (const scheduledRecallBot of scheduledRecallBotsResult.bots) {
    if (getClaimedWorkspaceId(scheduledRecallBot) !== currentWorkspaceId) {
      continue;
    }

    if (Date.now() >= cancellationCutoffEpochMs) {
      cutoffReached = true;

      break;
    }

    await cancelBotOncePerCleanup(scheduledRecallBot.id);
  }

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
