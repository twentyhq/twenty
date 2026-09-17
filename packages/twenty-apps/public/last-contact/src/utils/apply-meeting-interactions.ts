import { type CoreApiClient } from 'twenty-client-sdk/core';

import { collectCalendarEventInteractions } from 'src/utils/collect-calendar-event-interactions';
import {
  type Interaction,
  pickLatestInteraction,
  updatePersonForInteractions,
} from 'src/utils/update-person-last-contact';
import {
  type RelatedInteraction,
  updateRelatedLastContactForPeople,
} from 'src/utils/update-related-last-contact';

export type CalendarEventParticipantLink = {
  personId: string;
  calendarEventId: string;
};

export const applyMeetingInteractions = async (
  client: CoreApiClient,
  links: CalendarEventParticipantLink[],
): Promise<void> => {
  const calendarEventIds = [
    ...new Set(links.map((link) => link.calendarEventId)),
  ];

  if (calendarEventIds.length === 0) {
    return;
  }

  const interactionByCalendarEventId = await collectCalendarEventInteractions(
    client,
    calendarEventIds,
  );
  const interactionsByPersonId = new Map<string, Interaction[]>();

  for (const { personId, calendarEventId } of links) {
    const calendarEvent = interactionByCalendarEventId.get(calendarEventId);

    if (!calendarEvent) {
      continue;
    }

    const interaction: Interaction = {
      kind: 'meeting',
      occurredAt: calendarEvent.startsAt,
      itemId: calendarEventId,
      workspaceMemberId: calendarEvent.workspaceMemberId,
    };
    const interactions = interactionsByPersonId.get(personId);

    if (interactions) {
      interactions.push(interaction);
    } else {
      interactionsByPersonId.set(personId, [interaction]);
    }
  }

  const contactByPersonId = new Map<string, RelatedInteraction>();

  for (const [personId, interactions] of interactionsByPersonId) {
    await updatePersonForInteractions(client, personId, interactions);

    const latest = pickLatestInteraction(interactions);

    if (latest) {
      contactByPersonId.set(personId, {
        occurredAt: latest.occurredAt,
        itemId: latest.itemId,
        kind: 'meeting',
      });
    }
  }

  await updateRelatedLastContactForPeople(client, contactByPersonId);
};
