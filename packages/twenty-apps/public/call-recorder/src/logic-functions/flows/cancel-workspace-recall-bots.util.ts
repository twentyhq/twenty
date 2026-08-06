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
};

export const cancelWorkspaceRecallBots = async ({
  joinAtAfter,
}: {
  joinAtAfter: string;
}): Promise<CancelWorkspaceRecallBotsResult> => {
  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    console.warn(
      '[call-recorder] cannot cancel workspace Recall bots: workspace id unavailable',
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
    };
  }

  const listResult = await listScheduledRecallBots({
    joinAtAfter,
    metadata: { twentyWorkspaceId: currentWorkspaceId },
  });

  if (!listResult.ok) {
    console.warn(
      `[call-recorder] failed to list Recall bots for uninstall cancellation: ${listResult.errorMessage}`,
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      failedExternalBotIds: [],
      truncatedBotList: false,
    };
  }

  const workspaceBots = listResult.bots.filter((bot) => {
    const claimedWorkspaceId = bot.metadata.twentyWorkspaceId;

    return (
      isNonEmptyString(claimedWorkspaceId) &&
      claimedWorkspaceId.trim() === currentWorkspaceId
    );
  });

  const canceledExternalBotIds: string[] = [];
  const failedExternalBotIds: string[] = [];

  for (const bot of workspaceBots) {
    const cancelResult = await cancelRecallBot({ externalBotId: bot.id });

    if (cancelResult.ok) {
      canceledExternalBotIds.push(bot.id);
    } else {
      console.warn(
        `[call-recorder] failed to cancel Recall bot ${bot.id} on uninstall: ${cancelResult.errorMessage}`,
      );
      failedExternalBotIds.push(bot.id);
    }
  }

  return {
    scannedBotCount: listResult.bots.length,
    canceledExternalBotIds,
    failedExternalBotIds,
    truncatedBotList: listResult.truncated,
  };
};
