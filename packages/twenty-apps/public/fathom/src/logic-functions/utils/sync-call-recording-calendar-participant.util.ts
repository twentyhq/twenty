import { type CoreApiClient } from 'twenty-client-sdk/core';

import { APP_DISPLAY_NAME } from 'src/constants/universal-identifiers';

export const syncCallRecordingCalendarParticipant = async ({
  client,
  applicationId,
  callRecordingId,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  applicationId: string;
  callRecordingId: string;
}): Promise<void> => {
  const readCalendarEventId = async (): Promise<string | null | undefined> => {
    const result = await client.query({
      callRecordings: {
        __args: {
          filter: {
            id: { eq: callRecordingId },
          },
          first: 1,
        },
        edges: {
          node: { applicationId: true, calendarEventId: true, status: true },
        },
      },
    });
    const recording = result.callRecordings?.edges?.[0]?.node as
      | {
          applicationId?: string | null;
          calendarEventId?: string | null;
          status?: string | null;
        }
      | undefined;

    if (recording && recording.applicationId !== applicationId) {
      return null;
    }

    return !recording?.calendarEventId || recording.status === 'NOT_RECORDED'
      ? undefined
      : recording.calendarEventId;
  };

  let calendarEventId = await readCalendarEventId();
  if (calendarEventId === null) {
    return;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    if (!calendarEventId) {
      await client.mutation({
        destroyCalendarEventParticipants: {
          __args: {
            filter: {
              id: { eq: callRecordingId },
            },
          },
          id: true,
        },
      });
    } else {
      const data = {
        calendarEventId,
        handle: APP_DISPLAY_NAME,
        displayName: APP_DISPLAY_NAME,
        isOrganizer: false,
        responseStatus: 'ACCEPTED' as const,
      };

      try {
        await client.mutation({
          createCalendarEventParticipants: {
            __args: {
              data: [{ id: callRecordingId, ...data }],
              upsert: true,
            },
            id: true,
          },
        });
      } catch (error) {
        const result = await client.mutation({
          updateCalendarEventParticipants: {
            __args: {
              filter: {
                id: { eq: callRecordingId },
              },
              data,
            },
            id: true,
          },
        });
        if ((result.updateCalendarEventParticipants ?? []).length === 0) {
          throw error;
        }
      }
    }

    const currentCalendarEventId = await readCalendarEventId();
    if (
      currentCalendarEventId === null ||
      currentCalendarEventId === calendarEventId
    ) {
      return;
    }
    calendarEventId = currentCalendarEventId;
  }

  throw new Error(
    'Recording changed during calendar participant synchronization',
  );
};
