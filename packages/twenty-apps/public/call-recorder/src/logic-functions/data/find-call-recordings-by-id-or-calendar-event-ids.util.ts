import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';

export const findCallRecordingsByIdOrCalendarEventIds = async (
  client: CoreApiClient,
  {
    callRecordingId,
    calendarEventIds,
  }: {
    callRecordingId: string;
    calendarEventIds: string[];
  },
): Promise<CallRecordingRecord[]> =>
  findCallRecordingsByFilter(client, {
    or: [
      { id: { eq: callRecordingId } },
      ...(calendarEventIds.length === 0
        ? []
        : [{ calendarEventId: { in: calendarEventIds } }]),
    ],
  });
