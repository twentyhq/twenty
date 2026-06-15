import { CoreApiClient } from 'twenty-client-sdk/core';

import { updatePersonLastContactAtIfNewer } from 'src/utils/update-person-last-contact-at';

export const updatePersonLastContactAtFromCalendar = async (
  client: CoreApiClient,
  personId: string,
): Promise<void> => {
  const now = new Date().toISOString();

  const { calendarEventParticipants } = await client.query({
    calendarEventParticipants: {
      __args: {
        filter: {
          personId: { eq: personId },
          calendarEvent: {
            startsAt: { lte: now },
            isCanceled: { eq: false },
          },
        },
        orderBy: [{ calendarEvent: { startsAt: 'DescNullsLast' } }],
        first: 1,
      },
      edges: {
        node: {
          id: true,
          calendarEvent: {
            id: true,
            startsAt: true,
          },
        },
      },
    },
  });

  const lastContactAt =
    calendarEventParticipants?.edges[0]?.node?.calendarEvent?.startsAt ?? null;

  if (!lastContactAt) {
    return;
  }

  await updatePersonLastContactAtIfNewer(client, personId, lastContactAt);
};
