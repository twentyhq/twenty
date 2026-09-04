import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

export const findCanceledCallRecordingsWithBot = async (
  client: CoreApiClient,
): Promise<CallRecordingRecord[]> => {
  const canceledCallRecordings = await findCallRecordingsByFilter(client, {
    recordingRequestStatus: { eq: CallRecordingRequestStatus.CANCELED },
    status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
  });

  return canceledCallRecordings.filter(
    (callRecording) => !isUndefined(callRecording.externalBotId),
  );
};
