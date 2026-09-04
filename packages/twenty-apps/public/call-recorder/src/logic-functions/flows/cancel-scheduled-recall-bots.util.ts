import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  SCHEDULED_RECALL_BOT_CANCELLATION_CONCURRENCY,
  SCHEDULED_RECALL_BOT_CANCELLATION_SLICE_SIZE,
} from 'src/logic-functions/constants/scheduled-recall-bot-cancellation';
import { findCanceledCallRecordingsWithBot } from 'src/logic-functions/data/find-canceled-call-recordings-with-bot.util';
import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
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
  const callRecordings = (
    await findCanceledCallRecordingsWithBot(client)
  ).slice(0, sliceSize);
  const canceledCallRecordingIds: string[] = [];
  const failedCallRecordingIds: string[] = [];

  for (const concurrentCallRecordings of getBatches(
    callRecordings,
    SCHEDULED_RECALL_BOT_CANCELLATION_CONCURRENCY,
  )) {
    await Promise.all(
      concurrentCallRecordings.map(async (callRecording) => {
        try {
          await cancelCallRecordingRequest({ client, callRecording });
          canceledCallRecordingIds.push(callRecording.id);
        } catch (error) {
          console.warn(
            `[call-recorder] failed to cancel the Recall bot of callRecording ${callRecording.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          failedCallRecordingIds.push(callRecording.id);
        }
      }),
    );
  }

  // Only a run that freed at least one bot continues, so a Recall outage stops
  // the chain here and leaves the rest to the daily cancellation retry.
  return {
    canceledCallRecordingIds,
    failedCallRecordingIds,
    hasMore:
      callRecordings.length === sliceSize &&
      canceledCallRecordingIds.length > 0,
  };
};
