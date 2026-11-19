import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SCHEDULED_RECALL_BOT_CANCELLATION_CONCURRENCY } from 'src/logic-functions/constants/scheduled-recall-bot-cancellation';
import { type ScheduledRecallBotCancellation } from 'src/logic-functions/types/scheduled-recall-bot-cancellation.type';
import {
  cancelRecallBotForCanceledCallRecording,
  type CancelRecallBotForCanceledCallRecordingOutcome,
} from 'src/logic-functions/flows/cancel-recall-bot-for-canceled-call-recording.util';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';

export type CancelScheduledRecallBotsResult = {
  canceledCallRecordingIds: string[];
  failedCallRecordingIds: string[];
};

type ScheduledRecallBotCancellationOutcome = {
  callRecordingId: string;
  outcome: CancelRecallBotForCanceledCallRecordingOutcome;
};

export const cancelScheduledRecallBots = async ({
  client,
  scheduledRecallBotCancellations,
}: {
  client: CoreApiClient;
  scheduledRecallBotCancellations: ScheduledRecallBotCancellation[];
}): Promise<CancelScheduledRecallBotsResult> => {
  const cancellationOutcomes: ScheduledRecallBotCancellationOutcome[] = [];

  for (const concurrentCancellations of getBatches(
    scheduledRecallBotCancellations,
    SCHEDULED_RECALL_BOT_CANCELLATION_CONCURRENCY,
  )) {
    cancellationOutcomes.push(
      ...(await Promise.all(
        concurrentCancellations.map((scheduledRecallBotCancellation) =>
          cancelScheduledRecallBotInIsolation({
            client,
            scheduledRecallBotCancellation,
          }),
        ),
      )),
    );
  }

  return {
    canceledCallRecordingIds: getCallRecordingIdsWithOutcome({
      cancellationOutcomes,
      outcome: 'canceled',
    }),
    failedCallRecordingIds: getCallRecordingIdsWithOutcome({
      cancellationOutcomes,
      outcome: 'failed',
    }),
  };
};

const cancelScheduledRecallBotInIsolation = async ({
  client,
  scheduledRecallBotCancellation: { callRecordingId, externalBotId },
}: {
  client: CoreApiClient;
  scheduledRecallBotCancellation: ScheduledRecallBotCancellation;
}): Promise<ScheduledRecallBotCancellationOutcome> => {
  try {
    return {
      callRecordingId,
      outcome: await cancelRecallBotForCanceledCallRecording({
        client,
        callRecordingId,
        externalBotId,
      }),
    };
  } catch (error) {
    console.warn(
      `[call-recorder] failed to cancel the Recall bot of canceled call recording ${callRecordingId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    return { callRecordingId, outcome: 'failed' };
  }
};

const getCallRecordingIdsWithOutcome = ({
  cancellationOutcomes,
  outcome,
}: {
  cancellationOutcomes: ScheduledRecallBotCancellationOutcome[];
  outcome: CancelRecallBotForCanceledCallRecordingOutcome;
}): string[] =>
  cancellationOutcomes
    .filter((cancellationOutcome) => cancellationOutcome.outcome === outcome)
    .map(({ callRecordingId }) => callRecordingId);
