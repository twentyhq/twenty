import { type CoreApiClient } from 'twenty-client-sdk/core';

import { pickContactTeamMemberId } from 'src/utils/pick-contact-team-member';
import { updatePersonForInteraction } from 'src/utils/update-person-last-contact';
import { updateRelatedLastContact } from 'src/utils/update-related-last-contact';

export const updatePersonLastContactFromCalendar = async (
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

  const calendarEvent =
    calendarEventParticipants?.edges[0]?.node?.calendarEvent ?? null;
  const occurredAt = calendarEvent?.startsAt ?? null;

  if (!calendarEvent?.id || !occurredAt) {
    return;
  }

  const { calendarEventParticipants: memberParticipants } = await client.query({
    calendarEventParticipants: {
      __args: {
        filter: {
          calendarEventId: { eq: calendarEvent.id },
          workspaceMemberId: { is: 'NOT_NULL' },
        },
        first: 200,
      },
      edges: {
        node: {
          isOrganizer: true,
          workspaceMemberId: true,
        },
      },
    },
  });

  const participants =
    memberParticipants?.edges?.map(
      (edge: {
        node: { isOrganizer: boolean | null; workspaceMemberId: string | null };
      }) => edge.node,
    ) ?? [];
  const workspaceMemberId = pickContactTeamMemberId(participants, {
    isOrganizer: true,
  });

  await updatePersonForInteraction(client, {
    personId,
    occurredAt,
    kind: 'meeting',
    itemId: calendarEvent.id,
    workspaceMemberId,
  });

  await updateRelatedLastContact(client, {
    personId,
    occurredAt,
    itemId: calendarEvent.id,
    kind: 'meeting',
  });
};
