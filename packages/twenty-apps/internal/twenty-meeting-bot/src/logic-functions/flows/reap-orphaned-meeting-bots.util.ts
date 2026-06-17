import { isNull, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { APPLICATION_ID_ENV_VAR_NAME } from 'src/logic-functions/constants/application-id-env-var-name';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { cancelRecallBot } from 'src/logic-functions/recall-api/cancel-recall-bot.util';
import { ejectRecallBot } from 'src/logic-functions/recall-api/eject-recall-bot.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import {
  listScheduledRecallBots,
  type RecallScheduledBot,
} from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

export type ReapOrphanedMeetingBotsResult = {
  scannedBotCount: number;
  canceledExternalBotIds: string[];
};

// Bots no open CallRecording request claims would still join; cancel them on Recall.
export const reapOrphanedMeetingBots = async ({
  client,
  joinAtAfter,
  joinAtBefore,
}: {
  client: CoreApiClient;
  joinAtAfter: string;
  joinAtBefore: string;
}): Promise<ReapOrphanedMeetingBotsResult> => {
  const listResult = await listScheduledRecallBots({
    joinAtAfter,
    joinAtBefore,
  });

  if (!listResult.ok) {
    console.warn(
      `[twenty-meeting-bot] failed to list Recall bots for orphan reaping: ${listResult.errorMessage}`,
    );

    return { scannedBotCount: 0, canceledExternalBotIds: [] };
  }

  const currentApplicationId = getCurrentApplicationId();
  const appManagedBots = listResult.bots.filter((bot) =>
    isCurrentApplicationManagedBot({ bot, currentApplicationId }),
  );

  if (appManagedBots.length === 0) {
    return {
      scannedBotCount: listResult.bots.length,
      canceledExternalBotIds: [],
    };
  }

  const callRecordings = await findCallRecordingsByIds(
    client,
    getUniqueSortedIds(
      appManagedBots.map((bot) => getClaimedCallRecordingId(bot)),
    ),
  );
  const callRecordingsById = new Map(
    callRecordings.map((callRecording) => [callRecording.id, callRecording]),
  );
  const canceledExternalBotIds: string[] = [];

  for (const bot of appManagedBots) {
    const claimedCallRecordingId = getClaimedCallRecordingId(bot);
    const callRecording = isUndefined(claimedCallRecordingId)
      ? undefined
      : callRecordingsById.get(claimedCallRecordingId);

    if (isBotClaimed({ bot, callRecording })) {
      continue;
    }

    console.warn(
      `[twenty-meeting-bot] canceling orphaned Recall bot ${bot.id} (claimed callRecording: ${claimedCallRecordingId})`,
    );

    if (await cancelOrEjectRecallBot(bot.id)) {
      canceledExternalBotIds.push(bot.id);
    }
  }

  return {
    scannedBotCount: listResult.bots.length,
    canceledExternalBotIds,
  };
};

const getClaimedCallRecordingId = (
  bot: RecallScheduledBot,
): string | undefined => {
  const claimedCallRecordingId = bot.metadata.twentyCallRecordingId;

  return normalizeOptionalString(claimedCallRecordingId);
};

const getClaimedApplicationId = (
  bot: RecallScheduledBot,
): string | undefined => {
  const claimedApplicationId = bot.metadata.twentyApplicationId;

  return normalizeOptionalString(claimedApplicationId);
};

const getCurrentApplicationId = (): string | undefined =>
  normalizeOptionalString(
    getApplicationVariableValue(APPLICATION_ID_ENV_VAR_NAME),
  );

const isCurrentApplicationManagedBot = ({
  bot,
  currentApplicationId,
}: {
  bot: RecallScheduledBot;
  currentApplicationId: string | undefined;
}): boolean => {
  if (isUndefined(getClaimedCallRecordingId(bot))) {
    return false;
  }

  const claimedApplicationId = getClaimedApplicationId(bot);

  return (
    !isUndefined(currentApplicationId) &&
    claimedApplicationId === currentApplicationId
  );
};

const isBotClaimed = ({
  bot,
  callRecording,
}: {
  bot: RecallScheduledBot;
  callRecording: CallRecordingRecord | undefined;
}): boolean => {
  if (
    callRecording?.recordingRequestStatus !==
    CallRecordingRequestStatus.REQUESTED
  ) {
    return false;
  }

  if (callRecording.externalBotId === bot.id) {
    return true;
  }

  // An id-less REQUESTED recording may have a bot-id write-back in flight; spare its bot.
  return isUndefined(callRecording.externalBotId);
};

const cancelOrEjectRecallBot = async (
  externalBotId: string,
): Promise<boolean> => {
  const cancelResult = await cancelRecallBot({ externalBotId });

  if (cancelResult.ok) {
    return true;
  }

  // Deleting only works for not-yet-joined bots; eject the ones already in a call.
  if (!isNull(cancelResult.status)) {
    const ejectResult = await ejectRecallBot({ externalBotId });

    if (ejectResult.ok) {
      return true;
    }
  }

  console.warn(
    `[twenty-meeting-bot] failed to cancel orphaned Recall bot ${externalBotId}: ${cancelResult.errorMessage}`,
  );

  return false;
};

const normalizeOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value.trim() : undefined;
