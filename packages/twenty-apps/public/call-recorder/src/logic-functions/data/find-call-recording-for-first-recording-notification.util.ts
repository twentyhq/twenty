import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingAttendee = {
  workspaceMemberId: string;
  isOrganizer: boolean;
};

type CalendarEventParticipantEdge = {
  node?: {
    workspaceMemberId?: string | null;
    isOrganizer?: boolean | null;
  } | null;
};

type CallRecordingForFirstRecordingNotification = {
  id: string;
  title: string | undefined;
  status: string | undefined;
  calendarEventId: string | undefined;
  attendees: CallRecordingAttendee[];
};

export const findCallRecordingForFirstRecordingNotification = async (
  client: CoreApiClient,
  { id }: { id: string },
): Promise<CallRecordingForFirstRecordingNotification | undefined> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: id } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          title: true,
          status: true,
          calendarEvent: {
            id: true,
            calendarEventParticipants: {
              edges: {
                node: {
                  workspaceMemberId: true,
                  isOrganizer: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const node = queryResult.callRecordings?.edges?.[0]?.node;

  if (isUndefined(node) || isNull(node)) {
    return undefined;
  }

  const participantEdges: CalendarEventParticipantEdge[] =
    node.calendarEvent?.calendarEventParticipants?.edges ?? [];

  return {
    id: node.id,
    title: getString(node.title),
    status: getString(node.status),
    calendarEventId: getString(node.calendarEvent?.id),
    attendees: participantEdges.flatMap(({ node: participant }) => {
      const workspaceMemberId = getString(participant?.workspaceMemberId);

      return isUndefined(workspaceMemberId)
        ? []
        : [
            {
              workspaceMemberId,
              isOrganizer: participant?.isOrganizer === true,
            },
          ];
    }),
  };
};
