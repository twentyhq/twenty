import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { updateNonTerminalCallRecordingState } from 'src/logic-functions/data/update-non-terminal-call-recording-state.util';

export const markCallRecordingNotRecorded = async ({
  client,
  callRecordingId,
  failureReason,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  failureReason: string;
}): Promise<void> => {
  await updateNonTerminalCallRecordingState(client, {
    callRecordingId,
    data: {
      status: CallRecordingStatus.NOT_RECORDED,
      callRecorderFailureReason: failureReason,
    },
  });

  console.warn(
    `[call-recorder] callRecording ${callRecordingId} will not be recorded: ${failureReason}`,
  );
};
