import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { cancelRecallBotUnlessReclaimed } from 'src/logic-functions/flows/cancel-recall-bot-unless-reclaimed.util';
import { enqueueRecallBotCancellationRetry } from 'src/logic-functions/data/enqueue-recall-bot-cancellation-retry.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { findScheduledRecallBotIdsByCallRecordingId } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-ids-by-call-recording-id.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

type RemovedCallRecordingBotMarkers = {
  externalBotId: string | undefined;
  botScheduleAttemptedAt: string | undefined;
};

export type RemoveRecallBotForRemovedCallRecordingResult =
  | { status: 'noBotMarker' }
  | { status: 'canceled'; externalBotId: string }
  | { status: 'reclaimed'; externalBotId: string }
  | { status: 'noBotFound' }
  | { status: 'retryScheduled' };

// Stamp-before-POST guarantees a row without markers cannot own a Recall bot,
// so marker-less removals cost zero Recall calls.
export const removeRecallBotForRemovedCallRecording = async ({
  client,
  callRecordingId,
  knownMarkers,
  canReadSoftDeletedRow,
  retry,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  knownMarkers: RemovedCallRecordingBotMarkers | undefined;
  canReadSoftDeletedRow: boolean;
  retry: { retryCount: number; maxRetries: number };
}): Promise<RemoveRecallBotForRemovedCallRecordingResult> => {
  const markers =
    knownMarkers ??
    (canReadSoftDeletedRow
      ? await readSoftDeletedCallRecordingBotMarkers(client, callRecordingId)
      : undefined);

  if (
    !isUndefined(markers) &&
    isUndefined(markers.externalBotId) &&
    isUndefined(markers.botScheduleAttemptedAt)
  ) {
    return { status: 'noBotMarker' };
  }

  const recordedExternalBotId = markers?.externalBotId;

  if (!isUndefined(recordedExternalBotId)) {
    return cancelRemovedCallRecordingBot({
      client,
      callRecordingId,
      externalBotId: recordedExternalBotId,
      retry,
    });
  }

  const lookupResult = await findScheduledRecallBotIdsByCallRecordingId();

  if (!lookupResult.ok) {
    return escalateRemovalFailure({
      callRecordingId,
      externalBotId: undefined,
      retry,
      stepLabel: `Recall bot lookup for removed callRecording ${callRecordingId}`,
    });
  }

  const foundExternalBotId =
    lookupResult.externalBotIdByCallRecordingId.get(callRecordingId);

  if (isUndefined(foundExternalBotId)) {
    return { status: 'noBotFound' };
  }

  return cancelRemovedCallRecordingBot({
    client,
    callRecordingId,
    externalBotId: foundExternalBotId,
    retry,
  });
};

const cancelRemovedCallRecordingBot = async ({
  client,
  callRecordingId,
  externalBotId,
  retry,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  externalBotId: string;
  retry: { retryCount: number; maxRetries: number };
}): Promise<RemoveRecallBotForRemovedCallRecordingResult> => {
  const cancelResult = await cancelRecallBotUnlessReclaimed({
    client,
    callRecordingId,
    externalBotId,
  });

  if (cancelResult.status === 'reclaimed') {
    return { status: 'reclaimed', externalBotId };
  }

  if (cancelResult.status === 'canceled') {
    return { status: 'canceled', externalBotId };
  }

  return escalateRemovalFailure({
    callRecordingId,
    externalBotId,
    retry,
    stepLabel: `Recall bot cancellation for removed callRecording ${callRecordingId}`,
  });
};

const readSoftDeletedCallRecordingBotMarkers = async (
  client: CoreApiClient,
  callRecordingId: string,
): Promise<RemovedCallRecordingBotMarkers | undefined> => {
  const callRecording = (
    await findCallRecordingsByFilter(client, {
      id: { eq: callRecordingId },
      or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
    })
  )[0];

  if (isUndefined(callRecording)) {
    return undefined;
  }

  return {
    externalBotId: callRecording.externalBotId,
    botScheduleAttemptedAt: callRecording.botScheduleAttemptedAt,
  };
};

const escalateRemovalFailure = async ({
  callRecordingId,
  externalBotId,
  retry,
  stepLabel,
}: {
  callRecordingId: string;
  externalBotId: string | undefined;
  retry: { retryCount: number; maxRetries: number };
  stepLabel: string;
}): Promise<{ status: 'retryScheduled' }> => {
  if (retry.retryCount < retry.maxRetries) {
    throw buildRetryableStepFailure(stepLabel, 'transient Recall failure');
  }

  await enqueueRecallBotCancellationRetry({
    callRecordingId,
    externalBotId,
    ladderAttempt: 0,
  });

  return { status: 'retryScheduled' };
};
