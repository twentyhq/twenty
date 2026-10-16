import { type CoreApiClient } from 'twenty-client-sdk/core';

export const destroyCallRecorderCalendarParticipants = async (
  client: CoreApiClient,
  callRecordingIds: string[],
): Promise<void> => {
  if (callRecordingIds.length === 0) {
    return;
  }

  await client.mutation({
    destroyCalendarEventParticipants: {
      __args: {
        filter: { id: { in: callRecordingIds } },
      },
      id: true,
    },
  });
};
