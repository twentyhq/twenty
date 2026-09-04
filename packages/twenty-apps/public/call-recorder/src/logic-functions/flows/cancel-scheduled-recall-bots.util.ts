import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  SCHEDULED_RECALL_BOT_CANCELLATION_CONCURRENCY,
  SCHEDULED_RECALL_BOT_CANCELLATION_SLICE_SIZE,
} from 'src/logic-functions/constants/scheduled-recall-bot-cancellation';
import { findCanceledCallRecordingsWithBot } from 'src/logic-functions/data/find-canceled-call-recordings-with-bot.util';
import { cancelRecallBotForCanceledCallRecording } from 'src/logic-functions/flows/cancel-recall-bot-for-canceled-call-recording.util';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

export type CancelScheduledRecallBotsResult = {
  canceledCallRecordingIds: string[];
  failedCallRecordingIds: string[];
  hasMore: boolean;
};

export const cancelScheduledRecallBots = async ({
  client,
  sliceSize = SCHEDULED_RECALL_BOT_CANCELLATION_SLICE_SIZE,
}: {
  client: CoreApiClient;
  sliceSize?: number;
}): Promise<CancelScheduledRecallBotsResult> => {
  const callRecordings = await findCanceledCallRecordingsWithBot(
    client,
    sliceSize,
  );
  const canceledCallRecordingIds: string[] = [];
  const failedCallRecordingIds: string[] = [];

  for (const concurrentCallRecordings of getBatches(
    callRecordings,
    SCHEDULED_RECALL_BOT_CANCELLATION_CONCURRENCY,
  )) {
    await Promise.all(
      concurrentCallRecordings.map(async (callRecording) => {
        if (isUndefined(callRecording.externalBotId)) {
          return;
        }

        const outcome = await cancelRecallBotForCanceledCallRecording({
          client,
          callRecordingId: callRecording.id,
          externalBotId: callRecording.externalBotId,
        });

        if (outcome === 'canceled') {
          canceledCallRecordingIds.push(callRecording.id);

          return;
        }

        if (outcome === 'failed') {
          failedCallRecordingIds.push(callRecording.id);
        }
      }),
    );
  }

  // Only a run that freed at least one bot continues. A row whose bot was
  // cleared drops out of the query, so the chain always makes real progress,
  // and a Recall outage stops it here and leaves the rest to the daily retry.
  return {
    canceledCallRecordingIds,
    failedCallRecordingIds,
    hasMore:
      callRecordings.length === sliceSize &&
      canceledCallRecordingIds.length > 0,
  };
};
