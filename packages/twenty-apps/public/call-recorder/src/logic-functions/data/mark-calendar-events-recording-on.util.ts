import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { CALENDAR_EVENT_UPDATE_BATCH_SIZE } from 'src/logic-functions/constants/calendar-event-update-batch-size';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

// Only a blank preference is written so a choice made meanwhile survives.
export const markCalendarEventsRecordingOn = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<number> => {
  let markedCalendarEventCount = 0;

  for (const calendarEventIdBatch of getBatches(
    getUniqueSortedIds(calendarEventIds),
    CALENDAR_EVENT_UPDATE_BATCH_SIZE,
  )) {
    const updateCalendarEventsResult = await client.mutation({
      updateCalendarEvents: {
        __args: {
          filter: {
            id: { in: calendarEventIdBatch },
            callRecorderPreference: { is: 'NULL' },
          },
          data: {
            callRecorderPreference: CallRecorderPreference.ON,
          },
        },
        id: true,
      },
    });

    markedCalendarEventCount += (
      updateCalendarEventsResult.updateCalendarEvents ?? []
    ).length;
  }

  return markedCalendarEventCount;
};
