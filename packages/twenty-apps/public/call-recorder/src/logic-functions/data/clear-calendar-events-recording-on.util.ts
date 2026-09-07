import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { CALENDAR_EVENT_UPDATE_BATCH_SIZE } from 'src/logic-functions/constants/calendar-event-update-batch-size';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export const clearCalendarEventsRecordingOn = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<number> => {
  const calendarEventIdBatches = getBatches(
    getUniqueSortedIds(calendarEventIds),
    CALENDAR_EVENT_UPDATE_BATCH_SIZE,
  );
  let clearedCalendarEventCount = 0;
  const batchErrors: unknown[] = [];

  for (const calendarEventIdBatch of calendarEventIdBatches) {
    try {
      const updateCalendarEventsResult = await client.mutation({
        updateCalendarEvents: {
          __args: {
            filter: {
              id: { in: calendarEventIdBatch },
              callRecorderPreference: { eq: CallRecorderPreference.ON },
            },
            data: {
              callRecorderPreference: null,
            },
          },
          id: true,
        },
      });

      clearedCalendarEventCount += (
        updateCalendarEventsResult.updateCalendarEvents ?? []
      ).length;
    } catch (error) {
      batchErrors.push(error);
    }
  }

  if (batchErrors.length > 0) {
    throw new Error(
      `${batchErrors.length} of ${calendarEventIdBatches.length} calendar event preference batches failed: ${batchErrors
        .map((batchError) =>
          batchError instanceof Error ? batchError.message : String(batchError),
        )
        .join('; ')}`,
    );
  }

  return clearedCalendarEventCount;
};
