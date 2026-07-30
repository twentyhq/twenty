import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import { PAGE_SIZE } from 'src/utils/last-contact/page-size';
import { type MeetingInteraction } from 'src/utils/last-contact/types';

export const collectMeetingInteractions = async (
  client: CoreApiClient,
  personIds?: string[],
): Promise<MeetingInteraction[]> => {
  if (personIds && personIds.length === 0) {
    return [];
  }

  const personFilter = personIds
    ? { personId: { in: personIds } }
    : { personId: { is: 'NOT_NULL' } };
  const now = new Date().toISOString();
  const interactions: MeetingInteraction[] = [];
  let after: string | undefined;

  do {
    const { calendarEventParticipants } = await executeWithRetry(() =>
      client.query({
        calendarEventParticipants: {
          __args: {
            filter: personFilter,
            first: PAGE_SIZE,
            after,
          },
          edges: {
            node: {
              id: true,
              personId: true,
              calendarEvent: { id: true, startsAt: true, isCanceled: true },
            },
          },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    for (const edge of calendarEventParticipants?.edges ?? []) {
      const { personId, calendarEvent } = edge.node;
      if (
        personId &&
        calendarEvent?.id &&
        calendarEvent?.startsAt &&
        !calendarEvent.isCanceled &&
        calendarEvent.startsAt <= now
      ) {
        interactions.push({
          personId,
          calendarEventId: calendarEvent.id,
          startsAt: calendarEvent.startsAt,
        });
      }
    }

    after = calendarEventParticipants?.pageInfo.hasNextPage
      ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return interactions;
};
