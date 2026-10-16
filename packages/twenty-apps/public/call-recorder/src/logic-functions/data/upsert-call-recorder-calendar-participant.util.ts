import { type CoreApiClient } from 'twenty-client-sdk/core';

import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';

export const upsertCallRecorderCalendarParticipant = async (
  client: CoreApiClient,
  {
    callRecordingId,
    calendarEventId,
  }: {
    callRecordingId: string;
    calendarEventId: string;
  },
): Promise<void> => {
  await client.mutation({
    createCalendarEventParticipants: {
      __args: {
        data: [
          {
            id: callRecordingId,
            calendarEventId,
            handle: APP_DISPLAY_NAME,
            displayName: APP_DISPLAY_NAME,
            isOrganizer: false,
            responseStatus: 'ACCEPTED',
          },
        ],
        upsert: true,
      },
      id: true,
    },
  });
};
