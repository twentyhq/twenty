import { isUndefined } from '@sniptt/guards';

import { ACTIVE_RECALL_BOT_STATUSES } from 'src/logic-functions/constants/active-recall-bot-statuses';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

export type RemovedCallRecordingRecallFields = {
  externalBotId?: string | null;
  botScheduleAttemptedAt?: string | null;
};

export type RemoveRecallBotsForRemovedCallRecordingResult = {
  removedExternalBotIds: string[];
};

export const removeRecallBotsForRemovedCallRecording = async ({
  callRecordingId,
  externalBotId: rawExternalBotId,
  botScheduleAttemptedAt,
}: RemovedCallRecordingRecallFields & {
  callRecordingId: string;
}): Promise<RemoveRecallBotsForRemovedCallRecordingResult> => {
  const externalBotId = normalizeOptionalString(rawExternalBotId);

  if (!isUndefined(externalBotId)) {
    await removeRecallBotOrThrow(externalBotId);

    return { removedExternalBotIds: [externalBotId] };
  }

  if (isUndefined(normalizeOptionalString(botScheduleAttemptedAt))) {
    return { removedExternalBotIds: [] };
  }

  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    throw new Error(
      `Cannot find Recall bots for removed CallRecording ${callRecordingId}: workspace id unavailable`,
    );
  }

  const listResult = await listScheduledRecallBots({
    metadata: {
      twentyWorkspaceId: workspaceId,
      twentyCallRecordingId: callRecordingId,
    },
    statuses: ACTIVE_RECALL_BOT_STATUSES,
  });

  if (!listResult.ok) {
    throw new Error(
      `Failed to find Recall bots for removed CallRecording ${callRecordingId}: ${listResult.errorMessage}`,
    );
  }

  if (listResult.truncated) {
    throw new Error(
      `Failed to find every Recall bot for removed CallRecording ${callRecordingId}: result was truncated`,
    );
  }

  const matchingExternalBotIds = getUniqueSortedIds(
    listResult.bots
      .filter(
        (bot) =>
          bot.metadata.twentyWorkspaceId === workspaceId &&
          bot.metadata.twentyCallRecordingId === callRecordingId,
      )
      .map((bot) => bot.id),
  );

  for (const matchingExternalBotId of matchingExternalBotIds) {
    await removeRecallBotOrThrow(matchingExternalBotId);
  }

  return { removedExternalBotIds: matchingExternalBotIds };
};

const removeRecallBotOrThrow = async (externalBotId: string): Promise<void> => {
  if (await cancelOrEjectRecallBot(externalBotId)) {
    return;
  }

  throw new Error(`Failed to remove Recall bot ${externalBotId}`);
};
