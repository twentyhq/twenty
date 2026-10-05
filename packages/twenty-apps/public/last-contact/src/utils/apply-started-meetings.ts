import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  applyMeetingInteractions,
  type CalendarEventParticipantLink,
} from 'src/utils/apply-meeting-interactions';
import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;

export const applyStartedMeetings = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<void> => {
  const linkByKey = new Map<string, CalendarEventParticipantLink>();

  for (const ids of chunk(calendarEventIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { calendarEventParticipants } = await executeWithRetry(() =>
        client.query({
          calendarEventParticipants: {
            __args: {
              filter: {
                calendarEventId: { in: ids },
                personId: { is: 'NOT_NULL' },
              },
              first: PAGE_SIZE,
              after,
            },
            edges: { node: { personId: true, calendarEventId: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of calendarEventParticipants?.edges ?? []) {
        const { personId, calendarEventId } = edge.node;

        if (personId && calendarEventId) {
          linkByKey.set(`${personId}:${calendarEventId}`, {
            personId,
            calendarEventId,
          });
        }
      }

      after = calendarEventParticipants?.pageInfo.hasNextPage
        ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  await applyMeetingInteractions(client, [...linkByKey.values()]);
};
