import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { pickContactTeamMemberId } from 'src/utils/pick-contact-team-member';
import { type LastContactItem } from 'src/utils/update-person-last-contact-at';

const PAGE_SIZE = 200;
const UPDATE_BATCH_SIZE = 20;

type ContactRecord = {
  contactedAt: string;
  workspaceMemberId: string | null;
  item: LastContactItem;
};
type ContactsByPersonId = Map<string, ContactRecord>;

type PersonUpdateData = {
  lastContactAt: string;
  lastContactById?: string;
  lastContactItemMessageId: string | null;
  lastContactItemCalendarEventId: string | null;
};

const buildData = (record: ContactRecord): PersonUpdateData => ({
  lastContactAt: record.contactedAt,
  ...(record.workspaceMemberId
    ? { lastContactById: record.workspaceMemberId }
    : {}),
  ...(record.item.type === 'message'
    ? {
        lastContactItemMessageId: record.item.id,
        lastContactItemCalendarEventId: null,
      }
    : {
        lastContactItemCalendarEventId: record.item.id,
        lastContactItemMessageId: null,
      }),
});

const recordContact = (
  contacts: ContactsByPersonId,
  personId: string,
  record: ContactRecord,
): void => {
  const current = contacts.get(personId);
  if (!current || record.contactedAt > current.contactedAt) {
    contacts.set(personId, record);
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
  contacts: ContactsByPersonId,
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
              messageParticipants: {
                edges: {
                  node: { role: true, workspaceMemberId: true },
                },
              },
            },
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of messageParticipants?.edges ?? []) {
      const { personId, message } = edge.node;
      if (personId && message?.id && message?.receivedAt) {
        const participants =
          message.messageParticipants?.edges?.map(
            (e: {
              node: { role: string | null; workspaceMemberId: string | null };
            }) => e.node,
          ) ?? [];
        recordContact(contacts, personId, {
          contactedAt: message.receivedAt,
          workspaceMemberId: pickContactTeamMemberId(participants, {
            role: 'from',
          }),
          item: { type: 'message', id: message.id },
        });
      }
    }

    after = messageParticipants?.pageInfo.hasNextPage
      ? (messageParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);
};

const collectCalendarContacts = async (
  client: CoreApiClient,
  contacts: ContactsByPersonId,
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
              calendarEventParticipants: {
                edges: {
                  node: { isOrganizer: true, workspaceMemberId: true },
                },
              },
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
        calendarEvent?.id &&
        calendarEvent?.startsAt &&
        !calendarEvent.isCanceled &&
        calendarEvent.startsAt <= now
      ) {
        const participants =
          calendarEvent.calendarEventParticipants?.edges?.map(
            (e: {
              node: {
                isOrganizer: boolean | null;
                workspaceMemberId: string | null;
              };
            }) => e.node,
          ) ?? [];
        recordContact(contacts, personId, {
          contactedAt: calendarEvent.startsAt,
          workspaceMemberId: pickContactTeamMemberId(participants, {
            isOrganizer: true,
          }),
          item: { type: 'calendarEvent', id: calendarEvent.id },
        });
      }
    }

    after = calendarEventParticipants?.pageInfo.hasNextPage
      ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);
};

const findPersonsToUpdate = async (
  client: CoreApiClient,
  contacts: ContactsByPersonId,
): Promise<{ personId: string; data: PersonUpdateData }[]> => {
  const updates: { personId: string; data: PersonUpdateData }[] = [];

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
      const record = contacts.get(id);
      if (
        record &&
        (!currentLastContactAt || currentLastContactAt < record.contactedAt)
      ) {
        updates.push({ personId: id, data: buildData(record) });
      }
    }
  }

  return updates;
};

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();
  const contacts: ContactsByPersonId = new Map();

  await Promise.all([
    collectEmailContacts(client, contacts),
    collectCalendarContacts(client, contacts),
  ]);

  const updates = await findPersonsToUpdate(client, contacts);

  for (const batch of chunk(updates, UPDATE_BATCH_SIZE)) {
    await Promise.all(
      batch.map(({ personId, data }) =>
        client.mutation({
          updatePerson: {
            __args: {
              id: personId,
              data,
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
