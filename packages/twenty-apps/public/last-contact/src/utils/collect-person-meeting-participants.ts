import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;

export type PersonMeetingParticipant = {
  personId: string;
  calendarEventId: string;
  startsAt: string;
};

export const collectPersonMeetingParticipants = async (
  client: CoreApiClient,
  {
    from,
    to,
    shouldStop = () => false,
  }: {
    from: Date;
    to?: Date;
    shouldStop?: (participant: PersonMeetingParticipant) => boolean;
  },
): Promise<PersonMeetingParticipant[]> => {
  const participants: PersonMeetingParticipant[] = [];
  let after: string | undefined;

  do {
    const { calendarEventParticipants } = await executeWithRetry(() =>
      client.query({
        calendarEventParticipants: {
          __args: {
            filter: {
              and: [
                { personId: { is: 'NOT_NULL' } },
                { calendarEvent: { startsAt: { gte: from.toISOString() } } },
                ...(to
                  ? [{ calendarEvent: { startsAt: { lt: to.toISOString() } } }]
                  : []),
                { calendarEvent: { isCanceled: { eq: false } } },
              ],
            },
            orderBy: [{ calendarEvent: { startsAt: 'AscNullsLast' } }],
            first: PAGE_SIZE,
            after,
          },
          edges: {
            node: {
              personId: true,
              calendarEventId: true,
              calendarEvent: { startsAt: true },
            },
          },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    let hasReachedStop = false;

    for (const edge of calendarEventParticipants?.edges ?? []) {
      const { personId, calendarEventId, calendarEvent } = edge.node;

      if (!personId || !calendarEventId || !calendarEvent?.startsAt) {
        continue;
      }

      const participant = {
        personId,
        calendarEventId,
        startsAt: calendarEvent.startsAt,
      };

      participants.push(participant);

      if (shouldStop(participant)) {
        hasReachedStop = true;
        break;
      }
    }

    after =
      !hasReachedStop && calendarEventParticipants?.pageInfo.hasNextPage
        ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
  } while (after);

  return participants;
};
