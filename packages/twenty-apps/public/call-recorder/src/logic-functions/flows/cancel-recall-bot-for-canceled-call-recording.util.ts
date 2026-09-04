import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { replaceCanceledCallRecordingExternalBotId } from 'src/logic-functions/data/replace-canceled-call-recording-external-bot-id.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';

export type CancelRecallBotForCanceledCallRecordingOutcome =
  | 'canceled'
  | 'skipped'
  | 'failed';

export const cancelRecallBotForCanceledCallRecording = async ({
  client,
  callRecordingId,
  externalBotId,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  externalBotId: string;
}): Promise<CancelRecallBotForCanceledCallRecordingOutcome> => {
  // Calendar reconciliation can reactivate the request while this job is running.
  const latestCallRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (
    latestCallRecording?.recordingRequestStatus !==
      CallRecordingRequestStatus.CANCELED ||
    (!isUndefined(latestCallRecording.externalBotId) &&
      latestCallRecording.externalBotId !== externalBotId)
  ) {
    return 'skipped';
  }

  if (!(await cancelOrEjectRecallBot(externalBotId))) {
    return 'failed';
  }

  if (latestCallRecording.externalBotId === externalBotId) {
    await replaceCanceledCallRecordingExternalBotId(client, {
      id: callRecordingId,
      expectedExternalBotId: externalBotId,
      nextExternalBotId: null,
    });
  }

  return 'canceled';
};
