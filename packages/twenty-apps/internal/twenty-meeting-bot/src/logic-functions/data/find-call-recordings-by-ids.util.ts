import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';

export const findCallRecordingsByIds = async (
  client: CoreApiClient,
  callRecordingIds: string[],
): Promise<CallRecordingRecord[]> => {
  if (callRecordingIds.length === 0) {
    return [];
  }

  return findCallRecordingsByFilter(client, {
    id: { in: callRecordingIds },
  });
};
