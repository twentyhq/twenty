import { type CoreApiClient } from 'twenty-client-sdk/core';

import { APP_DISPLAY_NAME } from 'src/constants/universal-identifiers';

export const upsertCallRecordingCalendarParticipant = async ({
  coreApiClient,
  callRecordingId,
  calendarEventId,
}: {
  coreApiClient: Pick<CoreApiClient, 'mutation'>;
  callRecordingId: string;
  calendarEventId: string;
}): Promise<void> => {
  await coreApiClient.mutation({
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
