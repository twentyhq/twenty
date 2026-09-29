import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';

export const setCalendarEventRecordingOn = async (
  client: CoreApiClient,
  calendarEventId: string,
): Promise<void> => {
  await client.mutation({
    updateCalendarEvents: {
      __args: {
        filter: { id: { eq: calendarEventId } },
        data: { callRecorderPreference: CallRecorderPreference.ON },
      },
      id: true,
    },
  });
};
