import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import { chunk } from 'src/utils/last-contact/chunk';
import { PAGE_SIZE } from 'src/utils/last-contact/page-size';

export const collectCalendarOwners = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<Map<string, string>> => {
  const ownerByCalendarEventId = new Map<string, string>();

  for (const ids of chunk(calendarEventIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { calendarEventParticipants } = await executeWithRetry(() =>
        client.query({
          calendarEventParticipants: {
            __args: {
              filter: {
                calendarEventId: { in: ids },
                workspaceMemberId: { is: 'NOT_NULL' },
              },
              first: PAGE_SIZE,
              after,
            },
            edges: {
              node: {
                calendarEventId: true,
                isOrganizer: true,
                workspaceMemberId: true,
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of calendarEventParticipants?.edges ?? []) {
        const { calendarEventId, isOrganizer, workspaceMemberId } = edge.node;
        if (
          calendarEventId &&
          workspaceMemberId &&
          (!ownerByCalendarEventId.has(calendarEventId) || isOrganizer === true)
        ) {
          ownerByCalendarEventId.set(calendarEventId, workspaceMemberId);
        }
      }

      after = calendarEventParticipants?.pageInfo.hasNextPage
        ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return ownerByCalendarEventId;
};
