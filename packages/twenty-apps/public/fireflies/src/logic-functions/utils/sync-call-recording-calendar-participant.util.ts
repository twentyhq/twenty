import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { APP_DISPLAY_NAME } from 'src/constants/universal-identifiers';

type ParticipantAction =
  | { action: 'skip' | 'remove' }
  | { action: 'upsert'; calendarEventId: string };

export const syncCallRecordingCalendarParticipant = async ({
  client,
  applicationId,
  callRecordingId,
}: {
  client: Pick<CoreApiClient, 'query' | 'mutation'>;
  applicationId: string;
  callRecordingId: string;
}): Promise<void> => {
  const readParticipantAction = async (): Promise<ParticipantAction> => {
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
    const recording = result.callRecordings?.edges?.[0]?.node;

    if (isDefined(recording) && recording.applicationId !== applicationId) {
      return { action: 'skip' };
    }

    if (
      !isDefined(recording) ||
      !isNonEmptyString(recording.calendarEventId) ||
      recording.status === 'NOT_RECORDED'
    ) {
      return { action: 'remove' };
    }

    return { action: 'upsert', calendarEventId: recording.calendarEventId };
  };

  let participantAction = await readParticipantAction();
  if (participantAction.action === 'skip') {
    return;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    if (participantAction.action === 'remove') {
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
    } else if (participantAction.action === 'upsert') {
      const data = {
        calendarEventId: participantAction.calendarEventId,
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
        if (!isDefined(result.updateCalendarEventParticipants?.[0])) {
          throw error;
        }
      }
    }

    const currentAction = await readParticipantAction();
    if (
      currentAction.action === 'skip' ||
      (currentAction.action === 'remove' &&
        participantAction.action === 'remove') ||
      (currentAction.action === 'upsert' &&
        participantAction.action === 'upsert' &&
        currentAction.calendarEventId === participantAction.calendarEventId)
    ) {
      return;
    }
    participantAction = currentAction;
  }

  throw new Error(
    'Recording changed during calendar participant synchronization',
  );
};
