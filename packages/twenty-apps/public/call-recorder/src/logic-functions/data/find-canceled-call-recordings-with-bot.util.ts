import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

export const findCanceledCallRecordingsWithBot = async (
  client: CoreApiClient,
  limit: number,
): Promise<CallRecordingRecord[]> => {
  const maximumPageCount = Math.ceil(limit / TWENTY_PAGE_SIZE);
  let startedPageCount = 0;

  // Paging stops at the slice the caller can process, so a large cancellation
  // backlog does not get read in full on every run.
  const canceledCallRecordings = await findCallRecordingsByFilter(
    client,
    {
      recordingRequestStatus: { eq: CallRecordingRequestStatus.CANCELED },
      status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
      externalBotId: { is: 'NOT_NULL' },
    },
    () => startedPageCount++ < maximumPageCount,
  );

  return canceledCallRecordings.slice(0, limit);
};
