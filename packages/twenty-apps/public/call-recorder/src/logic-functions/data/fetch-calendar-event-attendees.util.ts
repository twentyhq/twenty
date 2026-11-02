import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { type CalendarEventAttendees } from 'src/logic-functions/types/calendar-event-attendees.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type CalendarEventParticipantNode = {
  calendarEventId?: string | null;
  workspaceMemberId?: string | null;
};

export const fetchCalendarEventAttendees = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<Map<string, CalendarEventAttendees>> => {
  const attendeesByCalendarEventId = new Map<string, CalendarEventAttendees>();

  if (calendarEventIds.length === 0) {
    return attendeesByCalendarEventId;
  }

  const participantNodes = await fetchAllNodes<CalendarEventParticipantNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEventParticipants: {
          __args: {
            filter: { calendarEventId: { in: calendarEventIds } },
            first: TWENTY_PAGE_SIZE,
            ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
          },
          pageInfo: {
            hasNextPage: true,
            endCursor: true,
          },
          edges: {
            node: {
              calendarEventId: true,
              workspaceMemberId: true,
            },
          },
        },
      });

      return queryResult.calendarEventParticipants as
        | ConnectionPage<CalendarEventParticipantNode>
        | undefined;
    },
  );

  for (const participant of participantNodes) {
    if (!isNonEmptyString(participant.calendarEventId)) {
      continue;
    }

    const attendees = attendeesByCalendarEventId.get(
      participant.calendarEventId,
    ) ?? { workspaceMemberIds: [], hasExternalAttendee: false };

    if (!isNonEmptyString(participant.workspaceMemberId)) {
      attendees.hasExternalAttendee = true;
    } else if (
      !attendees.workspaceMemberIds.includes(participant.workspaceMemberId)
    ) {
      attendees.workspaceMemberIds.push(participant.workspaceMemberId);
    }

    attendeesByCalendarEventId.set(participant.calendarEventId, attendees);
  }

  return attendeesByCalendarEventId;
};
