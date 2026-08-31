import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { cancelRecallBotUnlessReclaimed } from 'src/logic-functions/flows/cancel-recall-bot-unless-reclaimed.util';
import { enqueueRecallBotCancellationRetry } from 'src/logic-functions/data/enqueue-recall-bot-cancellation-retry.util';
import { findScheduledRecallBotIdsByCallRecordingId } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-ids-by-call-recording-id.util';

export type RetryRecallBotCancellationResult =
  | { status: 'aborted'; reason: string }
  | { status: 'canceled'; externalBotId: string }
  | { status: 'noBotFound' }
  | { status: 'retryScheduled'; ladderAttempt: number }
  | { status: 'gaveUp'; reason: string };

export const retryRecallBotCancellation = async ({
  client,
  callRecordingId,
  externalBotId,
  ladderAttempt,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  externalBotId: string | undefined;
  ladderAttempt: number;
}): Promise<RetryRecallBotCancellationResult> => {
  const resolution = isUndefined(externalBotId)
    ? await resolveExternalBotIdFromRecall(callRecordingId)
    : ({ outcome: 'resolved', externalBotId } as const);

  if (resolution.outcome === 'none') {
    return { status: 'noBotFound' };
  }

  if (resolution.outcome === 'resolved') {
    const cancelResult = await cancelRecallBotUnlessReclaimed({
      client,
      callRecordingId,
      externalBotId: resolution.externalBotId,
    });

    if (cancelResult.status === 'reclaimed') {
      return {
        status: 'aborted',
        reason: 'call recording is active again and owns the bot',
      };
    }

    if (cancelResult.status === 'canceled') {
      return { status: 'canceled', externalBotId: resolution.externalBotId };
    }
  }

  const nextLadderAttempt = ladderAttempt + 1;
  const retryScheduled = await enqueueRecallBotCancellationRetry({
    callRecordingId,
    externalBotId:
      resolution.outcome === 'resolved' ? resolution.externalBotId : undefined,
    ladderAttempt: nextLadderAttempt,
  });

  if (retryScheduled) {
    return { status: 'retryScheduled', ladderAttempt: nextLadderAttempt };
  }

  console.warn(
    `[call-recorder] giving up on Recall bot cancellation for callRecording ${callRecordingId}; the orphan sweep remains the backstop`,
  );

  return { status: 'gaveUp', reason: 'cancellation retry ladder exhausted' };
};

const resolveExternalBotIdFromRecall = async (
  callRecordingId: string,
): Promise<
  | { outcome: 'resolved'; externalBotId: string }
  | { outcome: 'none' }
  | { outcome: 'lookupFailed' }
> => {
  const lookupResult = await findScheduledRecallBotIdsByCallRecordingId();

  if (!lookupResult.ok) {
    return { outcome: 'lookupFailed' };
  }

  const externalBotId =
    lookupResult.externalBotIdByCallRecordingId.get(callRecordingId);

  return isUndefined(externalBotId)
    ? { outcome: 'none' }
    : { outcome: 'resolved', externalBotId };
};
