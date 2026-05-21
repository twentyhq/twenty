import { CoreApiClient } from 'twenty-client-sdk/core';

export const updateCalendarEventSummary = async ({
  client,
  calendarEventId,
  markdown,
}: {
  client: CoreApiClient;
  calendarEventId: string;
  markdown: string;
}): Promise<void> => {
  await client.mutation({
    updateCalendarEvent: {
      __args: {
        id: calendarEventId,
        data: {
          summary: {
            markdown,
            blocknote: null,
          },
        },
      },
      id: true,
    },
  });
};
