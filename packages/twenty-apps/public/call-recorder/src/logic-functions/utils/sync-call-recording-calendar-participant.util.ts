import { type CoreApiClient } from 'twenty-client-sdk/core';

import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const syncCallRecordingCalendarParticipant = async ({
  client,
  applicationId,
  callRecordingId,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  applicationId: string;
  callRecordingId: string;
}): Promise<void> => {
  const readCalendarEventId = async (): Promise<string | undefined> => {
    const result = await client.query({
      callRecordings: {
        __args: {
          filter: {
            id: { eq: callRecordingId },
            applicationId: { eq: applicationId },
          },
          first: 1,
        },
        edges: {
          node: { calendarEventId: true, externalBotId: true, status: true },
        },
      },
    });
    const recording = result.callRecordings?.edges?.[0]?.node as
      | {
          calendarEventId?: string | null;
          externalBotId?: string | null;
          status?: string | null;
        }
      | undefined;

    return !recording?.calendarEventId ||
      recording.status === CallRecordingStatus.NOT_RECORDED ||
      !recording.externalBotId?.trim()
      ? undefined
      : recording.calendarEventId;
  };

  let calendarEventId = await readCalendarEventId();

  for (let attempt = 0; attempt < 3; attempt++) {
    if (!calendarEventId) {
      await client.mutation({
        destroyCalendarEventParticipants: {
          __args: {
            filter: {
              id: { eq: callRecordingId },
              applicationId: { eq: applicationId },
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
              data: [{ id: callRecordingId, applicationId, ...data }],
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
                applicationId: { eq: applicationId },
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
    if (currentCalendarEventId === calendarEventId) {
      return;
    }
    calendarEventId = currentCalendarEventId;
  }

  throw new Error(
    'Recording changed during calendar participant synchronization',
  );
};
