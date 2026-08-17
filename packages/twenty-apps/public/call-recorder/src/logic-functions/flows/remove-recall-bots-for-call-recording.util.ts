import { isUndefined } from '@sniptt/guards';

import { ACTIVE_RECALL_BOT_STATUSES } from 'src/logic-functions/constants/active-recall-bot-statuses';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { type CallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';
import { isRecallBotRemovalCallRecordingStatus } from 'src/logic-functions/domain/is-recall-bot-removal-call-recording-status.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

export const removeRecallBotsForCallRecording = async ({
  callRecordingId,
  status,
  externalBotId,
  botScheduleAttempt,
}: {
  callRecordingId: string;
  status: string | undefined;
  externalBotId: string | undefined;
  botScheduleAttempt: CallRecordingBotScheduleAttempt | undefined;
}): Promise<string[]> => {
  if (!isRecallBotRemovalCallRecordingStatus(status)) {
    return [];
  }

  const botLookupResult = !isUndefined(externalBotId)
    ? { externalBotIds: [externalBotId], wasTruncated: false }
    : await findExternalBotIdsForAmbiguousAttempt({
        callRecordingId,
        botScheduleAttemptId: botScheduleAttempt?.id,
        hasAttemptMarker: !isUndefined(botScheduleAttempt),
      });

  for (const externalBotIdToRemove of botLookupResult.externalBotIds) {
    if (!(await cancelOrEjectRecallBot(externalBotIdToRemove))) {
      throw new Error(`Failed to remove Recall bot ${externalBotIdToRemove}`);
    }
  }

  if (botLookupResult.wasTruncated) {
    throw new Error('Recall bot lookup was truncated');
  }

  return botLookupResult.externalBotIds;
};

const findExternalBotIdsForAmbiguousAttempt = async ({
  callRecordingId,
  botScheduleAttemptId,
  hasAttemptMarker,
}: {
  callRecordingId: string;
  botScheduleAttemptId: string | undefined;
  hasAttemptMarker: boolean;
}): Promise<{ externalBotIds: string[]; wasTruncated: boolean }> => {
  if (!hasAttemptMarker) {
    return { externalBotIds: [], wasTruncated: false };
  }

  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    throw new Error('Cannot look up Recall bots without a workspace id');
  }

  const listResult = await listScheduledRecallBots({
    metadata: {
      twentyWorkspaceId: workspaceId,
      twentyCallRecordingId: callRecordingId,
      ...(isUndefined(botScheduleAttemptId)
        ? {}
        : { twentyBotScheduleAttemptId: botScheduleAttemptId }),
    },
    statuses: ACTIVE_RECALL_BOT_STATUSES,
  });

  if (!listResult.ok) {
    throw new Error(`Failed to look up Recall bots: ${listResult.errorMessage}`);
  }

  return {
    externalBotIds: [
      ...new Set(
        listResult.bots
          .filter(
            (bot) =>
              bot.metadata.twentyWorkspaceId === workspaceId &&
              bot.metadata.twentyCallRecordingId === callRecordingId &&
              (isUndefined(botScheduleAttemptId)
                ? isUndefined(bot.metadata.twentyBotScheduleAttemptId)
                : bot.metadata.twentyBotScheduleAttemptId ===
                  botScheduleAttemptId),
          )
          .map((bot) => bot.id),
      ),
    ],
    wasTruncated: listResult.truncated,
  };
};
