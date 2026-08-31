import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { isActiveRequestedCallRecording } from 'src/logic-functions/domain/is-active-requested-call-recording.util';

export type CancelRecallBotUnlessReclaimedResult =
  | { status: 'reclaimed' }
  | { status: 'canceled' }
  | { status: 'failed' };

// A restore can land any time after the triggering event, so ownership is
// re-read right before the irreversible Recall call.
export const cancelRecallBotUnlessReclaimed = async ({
  client,
  callRecordingId,
  externalBotId,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  externalBotId: string;
}): Promise<CancelRecallBotUnlessReclaimedResult> => {
  const callRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (
    isActiveRequestedCallRecording(callRecording) &&
    (isUndefined(callRecording.externalBotId) ||
      callRecording.externalBotId === externalBotId)
  ) {
    return { status: 'reclaimed' };
  }

  return (await cancelOrEjectRecallBot(externalBotId))
    ? { status: 'canceled' }
    : { status: 'failed' };
};
