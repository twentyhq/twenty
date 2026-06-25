import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';

export const findOpenScheduledCallRecordings = async (
  client: CoreApiClient,
): Promise<CallRecordingRecord[]> =>
  findCallRecordingsByFilter(client, {
    recordingRequestStatus: { eq: CallRecordingRequestStatus.REQUESTED },
    status: { eq: CallRecordingStatus.SCHEDULED },
  });
