import { isUndefined } from '@sniptt/guards';

import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

export type CancelWorkspaceRecallBotsResult = {
  scannedBotCount: number;
  canceledExternalBotIds: string[];
  failedExternalBotIds: string[];
  truncatedBotList: boolean;
  deadlineReached: boolean;
};

export const cancelWorkspaceRecallBots = async ({
  joinAtAfter,
  deadlineEpochMs,
}: {
  joinAtAfter: string;
  deadlineEpochMs: number;
}): Promise<CancelWorkspaceRecallBotsResult> => {
  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    console.warn(
      '[call-recorder] uninstall bot cleanup incomplete: workspace id unavailable',
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
      deadlineReached: false,
    };
  }

  const scannedExternalBotIds = new Set<string>();
  const attemptedCancellationExternalBotIds = new Set<string>();
  const canceledExternalBotIds = new Set<string>();
  const failedExternalBotIds = new Set<string>();
  let truncatedBotList = false;
  let deadlineReached = false;
  let continueDraining = true;

  // Canceled bots drop out of subsequent list responses, so re-listing after a
  // truncated pass pages through the remaining backlog.
  while (continueDraining) {
    if (Date.now() >= deadlineEpochMs) {
      deadlineReached = true;

      break;
    }

    const listResult = await listScheduledRecallBots({
      joinAtAfter,
      metadata: { twentyWorkspaceId: currentWorkspaceId },
    });

    if (!listResult.ok) {
      console.warn(
        `[call-recorder] uninstall bot cleanup incomplete: failed to list Recall bots: ${listResult.errorMessage}`,
      );

      break;
    }

    truncatedBotList = listResult.truncated;
    listResult.bots.forEach((bot) => scannedExternalBotIds.add(bot.id));

    const workspaceBots = listResult.bots.filter((bot) => {
      const claimedWorkspaceId = bot.metadata.twentyWorkspaceId;

      return (
        isNonEmptyString(claimedWorkspaceId) &&
        claimedWorkspaceId.trim() === currentWorkspaceId
      );
    });

    let canceledBotCountInCurrentPass = 0;

    for (const bot of workspaceBots) {
      if (attemptedCancellationExternalBotIds.has(bot.id)) {
        continue;
      }

      if (Date.now() >= deadlineEpochMs) {
        deadlineReached = true;

        break;
      }

      attemptedCancellationExternalBotIds.add(bot.id);
      const cancelResult = await cancelRecallBot({ externalBotId: bot.id });

      if (cancelResult.ok) {
        canceledExternalBotIds.add(bot.id);
        canceledBotCountInCurrentPass += 1;
      } else {
        console.warn(
          `[call-recorder] uninstall bot cleanup incomplete: failed to cancel Recall bot ${bot.id}: ${cancelResult.errorMessage}`,
        );
        failedExternalBotIds.add(bot.id);
      }
    }

    continueDraining =
      listResult.truncated &&
      canceledBotCountInCurrentPass > 0 &&
      !deadlineReached;
  }

  if (deadlineReached) {
    console.warn(
      '[call-recorder] uninstall bot cleanup incomplete: cancellation deadline reached',
    );
  }

  if (truncatedBotList) {
    console.warn(
      '[call-recorder] uninstall bot cleanup incomplete: bot list remains truncated',
    );
  }

  return {
    scannedBotCount: scannedExternalBotIds.size,
    canceledExternalBotIds: [...canceledExternalBotIds],
    failedExternalBotIds: [...failedExternalBotIds],
    truncatedBotList,
    deadlineReached,
  };
};
