import { CoreApiClient } from 'twenty-client-sdk/core';

import { updatePersonLastContactAtIfNewer } from 'src/utils/update-person-last-contact-at';

export const updatePersonLastContactAtFromCalendar = async (
  client: CoreApiClient,
  personId: string,
): Promise<void> => {
  const { calendarEventParticipants } = await client.query({
    calendarEventParticipants: {
      __args: {
        filter: { personId: { eq: personId } },
        orderBy: [{ calendarEvent: { startsAt: 'DescNullsLast' } }],
        first: 10,
      },
      edges: {
        node: {
          id: true,
          calendarEvent: {
            id: true,
            startsAt: true,
            isCanceled: true,
          },
        },
      },
    },
  });

  const now = new Date().toISOString();

  const lastContactAt =
    calendarEventParticipants?.edges
      .map((edge) => edge.node.calendarEvent)
      .find(
        (calendarEvent) =>
          !calendarEvent?.isCanceled &&
          calendarEvent?.startsAt &&
          calendarEvent.startsAt <= now,
      )?.startsAt ?? null;

  if (!lastContactAt) {
    return;
  }

  await updatePersonLastContactAtIfNewer(client, personId, lastContactAt);
};
