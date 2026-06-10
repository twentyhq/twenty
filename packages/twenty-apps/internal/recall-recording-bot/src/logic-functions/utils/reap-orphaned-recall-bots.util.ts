import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { findCallRecordingsByIds } from 'src/logic-functions/utils/find-call-recordings.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import {
  cancelRecallRecordingBot,
  ejectRecallRecordingBot,
  listScheduledRecallBots,
  type RecallScheduledBot,
} from 'src/logic-functions/utils/recall-bot-api.util';

export type ReapOrphanedRecallBotsResult = {
  scannedBotCount: number;
  canceledExternalBotIds: string[];
};

// A bot is orphaned when no CallRecording references it anymore: its id was
// overwritten by a concurrent schedule, or its recording was destroyed. Such
// bots would still join meetings, so the backstop cancels them on Recall.
export const reapOrphanedRecallBots = async ({
  client,
  joinAtAfter,
  joinAtBefore,
}: {
  client: CoreApiClient;
  joinAtAfter: string;
  joinAtBefore: string;
}): Promise<ReapOrphanedRecallBotsResult> => {
  const listResult = await listScheduledRecallBots({
    joinAtAfter,
    joinAtBefore,
  });

  if (!listResult.ok) {
    console.warn(
      `[recall-recording-bot] failed to list Recall bots for orphan reaping: ${listResult.errorMessage}`,
    );

    return { scannedBotCount: 0, canceledExternalBotIds: [] };
  }

  const appManagedBots = listResult.bots.filter(
    (bot) => getClaimedCallRecordingId(bot) !== null,
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
    const callRecording =
      claimedCallRecordingId === null
        ? undefined
        : callRecordingsById.get(claimedCallRecordingId);

    if (isBotClaimed({ bot, callRecording })) {
      continue;
    }

    console.warn(
      `[recall-recording-bot] canceling orphaned Recall bot ${bot.id} (claimed callRecording: ${claimedCallRecordingId})`,
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

const getClaimedCallRecordingId = (bot: RecallScheduledBot): string | null => {
  const claimedCallRecordingId = bot.metadata.twentyCallRecordingId;

  return typeof claimedCallRecordingId === 'string' &&
    claimedCallRecordingId !== ''
    ? claimedCallRecordingId
    : null;
};

const isBotClaimed = ({
  bot,
  callRecording,
}: {
  bot: RecallScheduledBot;
  callRecording: CallRecordingRecord | undefined;
}): boolean => {
  if (callRecording === undefined) {
    return false;
  }

  if (callRecording.externalBotId === bot.id) {
    return true;
  }

  // An id-less REQUESTED recording may have a bot-id write-back in flight;
  // grant it a grace round instead of risking a legitimate bot.
  return (
    callRecording.recordingRequestStatus ===
      CallRecordingRequestStatus.REQUESTED &&
    callRecording.externalBotId === null
  );
};

const cancelOrEjectRecallBot = async (
  externalBotId: string,
): Promise<boolean> => {
  const cancelResult = await cancelRecallRecordingBot({ externalBotId });

  if (cancelResult.ok) {
    return true;
  }

  // Deleting only works for not-yet-joined bots; eject the ones already in a
  // call (like orphans sitting in a waiting room).
  if (cancelResult.status !== null) {
    const ejectResult = await ejectRecallRecordingBot({ externalBotId });

    if (ejectResult.ok) {
      return true;
    }
  }

  console.warn(
    `[recall-recording-bot] failed to cancel orphaned Recall bot ${externalBotId}: ${cancelResult.errorMessage}`,
  );

  return false;
};
