import { CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { findCallRecordingsByFilter } from 'src/logic-functions/utils/find-call-recordings-by-filter.util';

export const findCallRecordingsByCalendarEventIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<CallRecordingRecord[]> => {
  if (calendarEventIds.length === 0) {
    return [];
  }

  return findCallRecordingsByFilter(client, {
    calendarEventId: { in: calendarEventIds },
  });
};
