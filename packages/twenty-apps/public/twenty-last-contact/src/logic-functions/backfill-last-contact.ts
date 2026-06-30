import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LastContactItem } from 'src/utils/update-person-last-contact';

const PAGE_SIZE = 200;
const UPDATE_BATCH_SIZE = 20;

type ContactRecord = {
  contactedAt: string;
  item: LastContactItem;
};
type ContactsByPersonId = Map<string, ContactRecord>;
type WorkspaceMemberByItemId = Map<string, string>;

type PersonUpdateData = {
  lastContactAt: string;
  lastContactById?: string;
  lastContactItemMessageId: string | null;
  lastContactItemCalendarEventId: string | null;
};

const buildData = (
  record: ContactRecord,
  workspaceMemberId: string | null,
): PersonUpdateData => ({
  lastContactAt: record.contactedAt,
  ...(workspaceMemberId ? { lastContactById: workspaceMemberId } : {}),
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
            },
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of messageParticipants?.edges ?? []) {
      const { personId, message } = edge.node;
      if (personId && message?.id && message?.receivedAt) {
        recordContact(contacts, personId, {
          contactedAt: message.receivedAt,
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
        recordContact(contacts, personId, {
          contactedAt: calendarEvent.startsAt,
          item: { type: 'calendarEvent', id: calendarEvent.id },
        });
      }
    }

    after = calendarEventParticipants?.pageInfo.hasNextPage
      ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);
};

const collectMessageMembers = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<WorkspaceMemberByItemId> => {
  const members: WorkspaceMemberByItemId = new Map();

  for (const ids of chunk(messageIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { messageParticipants } = await client.query({
        messageParticipants: {
          __args: {
            filter: {
              messageId: { in: ids },
              workspaceMemberId: { is: 'NOT_NULL' },
            },
            first: PAGE_SIZE,
            after,
          },
          edges: {
            node: {
              messageId: true,
              role: true,
              workspaceMemberId: true,
            },
          },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });

      for (const edge of messageParticipants?.edges ?? []) {
        const { messageId, role, workspaceMemberId } = edge.node;
        if (
          messageId &&
          workspaceMemberId &&
          (!members.has(messageId) || role === 'FROM')
        ) {
          members.set(messageId, workspaceMemberId);
        }
      }

      after = messageParticipants?.pageInfo.hasNextPage
        ? (messageParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return members;
};

const collectCalendarMembers = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<WorkspaceMemberByItemId> => {
  const members: WorkspaceMemberByItemId = new Map();

  for (const ids of chunk(calendarEventIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { calendarEventParticipants } = await client.query({
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
      });

      for (const edge of calendarEventParticipants?.edges ?? []) {
        const { calendarEventId, isOrganizer, workspaceMemberId } = edge.node;
        if (
          calendarEventId &&
          workspaceMemberId &&
          (!members.has(calendarEventId) || isOrganizer === true)
        ) {
          members.set(calendarEventId, workspaceMemberId);
        }
      }

      after = calendarEventParticipants?.pageInfo.hasNextPage
        ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return members;
};

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();
  const contacts: ContactsByPersonId = new Map();

  await Promise.all([
    collectEmailContacts(client, contacts),
    collectCalendarContacts(client, contacts),
  ]);

  const messageIds: string[] = [];
  const calendarEventIds: string[] = [];
  contacts.forEach((record) => {
    if (record.item.type === 'message') {
      messageIds.push(record.item.id);
    } else {
      calendarEventIds.push(record.item.id);
    }
  });

  const [memberByMessageId, memberByCalendarEventId] = await Promise.all([
    collectMessageMembers(client, messageIds),
    collectCalendarMembers(client, calendarEventIds),
  ]);

  const updates = [...contacts.entries()].map(([personId, record]) => {
    const workspaceMemberId =
      record.item.type === 'message'
        ? (memberByMessageId.get(record.item.id) ?? null)
        : (memberByCalendarEventId.get(record.item.id) ?? null);

    return { personId, data: buildData(record, workspaceMemberId) };
  });

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
  name: 'backfill-last-contact',
  description:
    'Fills person last-contacted fields from existing messages and calendar events after installation.',
  timeoutSeconds: 300,
  shouldRunOnVersionUpgrade: true,
  handler,
});
