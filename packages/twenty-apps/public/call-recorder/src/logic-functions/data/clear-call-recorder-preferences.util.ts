import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { CALENDAR_EVENT_UPDATE_BATCH_SIZE } from 'src/logic-functions/constants/calendar-event-update-batch-size';
import { getBatches } from 'src/logic-functions/utils/get-batches.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

// Only the default ON is cleared so a preference a user set meanwhile survives.
export const clearCallRecorderPreferences = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<number> => {
  let clearedCalendarEventCount = 0;

  for (const calendarEventIdBatch of getBatches(
    getUniqueSortedIds(calendarEventIds),
    CALENDAR_EVENT_UPDATE_BATCH_SIZE,
  )) {
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
  }

  return clearedCalendarEventCount;
};
