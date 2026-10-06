import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';

// Requests a follow-up may still have to finish: pending ones without a bot,
// and canceled ones whose bot may still be booked at Recall.
export const findStuckCallRecordingRequestIds = async (
  client: CoreApiClient,
): Promise<string[]> => {
  const pendingCallRecordings = (
    await findOpenScheduledCallRecordings(client)
  ).filter((callRecording) => isUndefined(callRecording.externalBotId));
  const canceledCallRecordings = (
    await findCallRecordingsByFilter(client, {
      recordingRequestStatus: { eq: CallRecordingRequestStatus.CANCELED },
      status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
    })
  ).filter(
    (callRecording) =>
      !isUndefined(callRecording.externalBotId) ||
      !isUndefined(callRecording.botScheduleAttemptedAt),
  );

  return [...pendingCallRecordings, ...canceledCallRecordings].map(
    (callRecording) => callRecording.id,
  );
};
