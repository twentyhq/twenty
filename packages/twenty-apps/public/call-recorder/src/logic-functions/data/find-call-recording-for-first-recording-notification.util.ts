import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingAttendee = {
  workspaceMemberId: string;
  isOrganizer: boolean;
};

type CalendarEventParticipantNode = {
  workspaceMemberId?: string | null;
  isOrganizer?: boolean | null;
};

type CallRecordingForFirstRecordingNotification = {
  id: string;
  title: string | undefined;
  status: string | undefined;
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
          calendarEventId: true,
        },
      },
    },
  });

  const node = queryResult.callRecordings?.edges?.[0]?.node;

  if (isUndefined(node) || isNull(node)) {
    return undefined;
  }

  const calendarEventId = getString(node.calendarEventId);

  const participants = isUndefined(calendarEventId)
    ? []
    : await fetchAllNodes<CalendarEventParticipantNode>(async (afterCursor) => {
        const participantsResult = await client.query({
          calendarEventParticipants: {
            __args: {
              filter: {
                calendarEventId: { eq: calendarEventId },
                workspaceMemberId: { is: 'NOT_NULL' },
              },
              first: TWENTY_PAGE_SIZE,
              ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
            },
            pageInfo: {
              hasNextPage: true,
              endCursor: true,
            },
            edges: {
              node: {
                workspaceMemberId: true,
                isOrganizer: true,
              },
            },
          },
        });

        return participantsResult.calendarEventParticipants as
          | ConnectionPage<CalendarEventParticipantNode>
          | undefined;
      });

  return {
    id: node.id,
    title: getString(node.title),
    status: getString(node.status),
    attendees: participants.flatMap((participant) => {
      const workspaceMemberId = getString(participant.workspaceMemberId);

      return isUndefined(workspaceMemberId)
        ? []
        : [
            {
              workspaceMemberId,
              isOrganizer: participant.isOrganizer ?? false,
            },
          ];
    }),
  };
};
