import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

export type RetryFailedRecallCancellationsResult = {
  canceledExternalBotCallRecordingIds: string[];
};

// Retries the Recall half of cancelCallRecordingRequest when its bot cancel failed; the recording keeps its bot id until the bot is confirmed gone.
export const retryFailedRecallCancellations = async ({
  client,
}: {
  client: CoreApiClient;
}): Promise<RetryFailedRecallCancellationsResult> => {
  const canceledCallRecordingsWithBot = await findCallRecordingsByFilter(
    client,
    {
      recordingRequestStatus: { eq: CallRecordingRequestStatus.CANCELED },
      status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
      externalBotId: { is: 'NOT_NULL' },
    },
  );
  const canceledExternalBotCallRecordingIds: string[] = [];

  for (const callRecording of canceledCallRecordingsWithBot) {
    if (isUndefined(callRecording.externalBotId)) {
      continue;
    }

    if (!(await cancelOrEjectRecallBot(callRecording.externalBotId))) {
      continue;
    }

    await updateCallRecording(client, {
      id: callRecording.id,
      data: { externalBotId: null },
    });
    canceledExternalBotCallRecordingIds.push(callRecording.id);
  }

  return { canceledExternalBotCallRecordingIds };
};
