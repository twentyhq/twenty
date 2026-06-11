import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const PAGE_SIZE = 200;
const UPDATE_BATCH_SIZE = 20;

type LastContactAtByPersonId = Map<string, string>;

const recordContact = (
  contacts: LastContactAtByPersonId,
  personId: string,
  contactedAt: string,
): void => {
  const current = contacts.get(personId);
  if (!current || contactedAt > current) {
    contacts.set(personId, contactedAt);
  }
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const collectEmailContacts = async (
  client: CoreApiClient,
  contacts: LastContactAtByPersonId,
): Promise<void> => {
  let after: string | undefined;

  do {
    const { messageParticipants } = await client.query({
      messageParticipants: {
        __args: {
          filter: { personId: { is: 'NOT_NULL' } },
          first: PAGE_SIZE,
          after,
        },
        edges: {
          node: {
            id: true,
            personId: true,
            message: {
              id: true,
              receivedAt: true,
            },
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of messageParticipants?.edges ?? []) {
      const { personId, message } = edge.node;
      if (personId && message?.receivedAt) {
        recordContact(contacts, personId, message.receivedAt);
      }
    }

    after = messageParticipants?.pageInfo.hasNextPage
      ? (messageParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);
};

const collectCalendarContacts = async (
  client: CoreApiClient,
  contacts: LastContactAtByPersonId,
): Promise<void> => {
  const now = new Date().toISOString();
  let after: string | undefined;

  do {
    const { calendarEventParticipants } = await client.query({
      calendarEventParticipants: {
        __args: {
          filter: { personId: { is: 'NOT_NULL' } },
          first: PAGE_SIZE,
          after,
        },
        edges: {
          node: {
            id: true,
            personId: true,
            calendarEvent: {
              id: true,
              startsAt: true,
              isCanceled: true,
            },
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of calendarEventParticipants?.edges ?? []) {
      const { personId, calendarEvent } = edge.node;
      if (
        personId &&
        calendarEvent?.startsAt &&
        !calendarEvent.isCanceled &&
        calendarEvent.startsAt <= now
      ) {
        recordContact(contacts, personId, calendarEvent.startsAt);
      }
    }

    after = calendarEventParticipants?.pageInfo.hasNextPage
      ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);
};

const findPersonsToUpdate = async (
  client: CoreApiClient,
  contacts: LastContactAtByPersonId,
): Promise<{ personId: string; lastContactAt: string }[]> => {
  const updates: { personId: string; lastContactAt: string }[] = [];

  for (const personIds of chunk([...contacts.keys()], PAGE_SIZE)) {
    const { people } = await client.query({
      people: {
        __args: {
          filter: { id: { in: personIds } },
          first: personIds.length,
        },
        edges: {
          node: {
            id: true,
            lastContactAt: true,
          },
        },
      },
    });

    for (const edge of people?.edges ?? []) {
      const { id, lastContactAt: currentLastContactAt } = edge.node;
      const lastContactAt = contacts.get(id);
      if (
        lastContactAt &&
        (!currentLastContactAt || currentLastContactAt < lastContactAt)
      ) {
        updates.push({ personId: id, lastContactAt });
      }
    }
  }

  return updates;
};

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();
  const contacts: LastContactAtByPersonId = new Map();

  await Promise.all([
    collectEmailContacts(client, contacts),
    collectCalendarContacts(client, contacts),
  ]);

  const updates = await findPersonsToUpdate(client, contacts);

  for (const batch of chunk(updates, UPDATE_BATCH_SIZE)) {
    await Promise.all(
      batch.map(({ personId, lastContactAt }) =>
        client.mutation({
          updatePerson: {
            __args: {
              id: personId,
              data: { lastContactAt },
            },
            id: true,
          },
        }),
      ),
    );
  }
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact-at',
  description:
    'Fills person last-contacted fields from existing messages and calendar events after installation.',
  timeoutSeconds: 300,
  shouldRunOnVersionUpgrade: false,
  handler,
});
