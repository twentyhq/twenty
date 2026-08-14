import { isUndefined } from '@sniptt/guards';

import { ACTIVE_RECALL_BOT_STATUSES } from 'src/logic-functions/constants/active-recall-bot-statuses';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { isRecallBotRemovalCallRecordingStatus } from 'src/logic-functions/domain/is-recall-bot-removal-call-recording-status.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

export const removeRecallBotsForCallRecording = async ({
  callRecordingId,
  status,
  externalBotId,
  botScheduleAttemptedAt,
  botScheduleIdempotencyKey,
}: {
  callRecordingId: string;
  status: string | undefined;
  externalBotId: string | undefined;
  botScheduleAttemptedAt: string | undefined;
  botScheduleIdempotencyKey: string | undefined;
}): Promise<string[]> => {
  if (!isRecallBotRemovalCallRecordingStatus(status)) {
    return [];
  }

  const externalBotIds = !isUndefined(externalBotId)
    ? [externalBotId]
    : await findExternalBotIdsForAmbiguousAttempt({
        callRecordingId,
        hasAttemptMarker:
          !isUndefined(botScheduleAttemptedAt) ||
          !isUndefined(botScheduleIdempotencyKey),
      });

  for (const id of externalBotIds) {
    if (!(await cancelOrEjectRecallBot(id))) {
      throw new Error(`Failed to remove Recall bot ${id}`);
    }
  }

  return externalBotIds;
};

const findExternalBotIdsForAmbiguousAttempt = async ({
  callRecordingId,
  hasAttemptMarker,
}: {
  callRecordingId: string;
  hasAttemptMarker: boolean;
}): Promise<string[]> => {
  if (!hasAttemptMarker) {
    return [];
  }

  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    throw new Error('Cannot look up Recall bots without a workspace id');
  }

  const listResult = await listScheduledRecallBots({
    metadata: {
      twentyWorkspaceId: workspaceId,
      twentyCallRecordingId: callRecordingId,
    },
    statuses: ACTIVE_RECALL_BOT_STATUSES,
  });

  if (!listResult.ok) {
    throw new Error(`Failed to look up Recall bots: ${listResult.errorMessage}`);
  }

  if (listResult.truncated) {
    throw new Error('Recall bot lookup was truncated');
  }

  return [
    ...new Set(
      listResult.bots
        .filter(
          (bot) =>
            bot.metadata.twentyWorkspaceId === workspaceId &&
            bot.metadata.twentyCallRecordingId === callRecordingId,
        )
        .map((bot) => bot.id),
    ),
  ];
};
