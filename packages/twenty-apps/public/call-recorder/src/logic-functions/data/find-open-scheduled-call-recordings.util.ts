import { type CoreApiClient } from 'twenty-client-sdk/core';

import { OPEN_SCHEDULED_CALL_RECORDING_FILTER } from 'src/logic-functions/constants/open-scheduled-call-recording-filter';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';

export const findOpenScheduledCallRecordings = async (
  client: CoreApiClient,
  shouldStartPageRequest: () => boolean = () => true,
): Promise<CallRecordingRecord[]> =>
  findCallRecordingsByFilter(
    client,
    OPEN_SCHEDULED_CALL_RECORDING_FILTER,
    shouldStartPageRequest,
  );
