import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';

export const markCallRecordingNotRecorded = async (
  client: CoreApiClient,
  {
    callRecordingId,
    failureReason,
  }: {
    callRecordingId: string;
    failureReason: string;
  },
): Promise<boolean> => {
  const didUpdate = await updateNonTerminalCallRecordingState(client, {
    callRecordingId,
    data: {
      status: CallRecordingStatus.NOT_RECORDED,
      callRecorderFailureReason: failureReason,
      externalBotId: null,
      botScheduleAttemptedAt: null,
      botScheduleIdempotencyKey: null,
    },
  });

  if (didUpdate) {
    console.warn(
      `[call-recorder] callRecording ${callRecordingId} will not be recorded: ${failureReason}`,
    );
  }

  return didUpdate;
};
