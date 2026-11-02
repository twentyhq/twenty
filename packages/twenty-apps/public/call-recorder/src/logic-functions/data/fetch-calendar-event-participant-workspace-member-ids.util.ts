import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type CalendarEventParticipantNode = {
  calendarEventId?: string | null;
  workspaceMemberId?: string | null;
};

export const fetchCalendarEventParticipantWorkspaceMemberIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<Map<string, string[]>> => {
  const workspaceMemberIdsByCalendarEventId = new Map<string, string[]>();

  if (calendarEventIds.length === 0) {
    return workspaceMemberIdsByCalendarEventId;
  }

  const participantNodes = await fetchAllNodes<CalendarEventParticipantNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEventParticipants: {
          __args: {
            filter: {
              calendarEventId: { in: calendarEventIds },
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
    if (
      !isNonEmptyString(participant.calendarEventId) ||
      !isNonEmptyString(participant.workspaceMemberId)
    ) {
      continue;
    }

    const workspaceMemberIds =
      workspaceMemberIdsByCalendarEventId.get(participant.calendarEventId) ??
      [];

    if (!workspaceMemberIds.includes(participant.workspaceMemberId)) {
      workspaceMemberIds.push(participant.workspaceMemberId);
    }

    workspaceMemberIdsByCalendarEventId.set(
      participant.calendarEventId,
      workspaceMemberIds,
    );
  }

  return workspaceMemberIdsByCalendarEventId;
};
