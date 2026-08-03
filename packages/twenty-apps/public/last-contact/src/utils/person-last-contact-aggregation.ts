import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;

type EmailInteraction = {
  personId: string;
  messageId: string;
  receivedAt: string;
};
type MeetingInteraction = {
  personId: string;
  calendarEventId: string;
  startsAt: string;
};
type MessageMemberInfo = { ownerId: string; fromIsMember: boolean };
type ContactItem = { kind: 'email' | 'meeting'; id: string };

export type LastContact = { at: string; item: ContactItem };
export type PersonUpdateData = Record<string, string | null>;

export type PersonAgg = {
  lastContactAt?: string;
  lastContactById?: string | null;
  item?: ContactItem;
  lastOutboundAt?: string;
  lastInboundAt?: string;
  lastEmail?: { at: string; id: string };
  lastMeeting?: { at: string; id: string };
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const collectEmailInteractions = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<EmailInteraction[]> => {
  const interactions: EmailInteraction[] = [];

  for (const ids of chunk(personIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { messageParticipants } = await executeWithRetry(() =>
        client.query({
          messageParticipants: {
            __args: {
              filter: { personId: { in: ids } },
              first: PAGE_SIZE,
              after,
            },
            edges: {
              node: {
                id: true,
                personId: true,
                message: { id: true, receivedAt: true },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of messageParticipants?.edges ?? []) {
        const { personId, message } = edge.node;
        if (personId && message?.id && message?.receivedAt) {
          interactions.push({
            personId,
            messageId: message.id,
            receivedAt: message.receivedAt,
          });
        }
      }

      after = messageParticipants?.pageInfo.hasNextPage
        ? (messageParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return interactions;
};

const collectMeetingInteractions = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<MeetingInteraction[]> => {
  const now = new Date().toISOString();
  const interactions: MeetingInteraction[] = [];

  for (const ids of chunk(personIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { calendarEventParticipants } = await executeWithRetry(() =>
        client.query({
          calendarEventParticipants: {
            __args: {
              filter: { personId: { in: ids } },
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
  }

  return interactions;
};

const collectMessageMemberInfo = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<Map<string, MessageMemberInfo>> => {
  const infoByMessageId = new Map<string, MessageMemberInfo>();

  for (const ids of chunk(messageIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { messageParticipants } = await executeWithRetry(() =>
        client.query({
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
              node: { messageId: true, role: true, workspaceMemberId: true },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of messageParticipants?.edges ?? []) {
        const { messageId, role, workspaceMemberId } = edge.node;
        if (!messageId || !workspaceMemberId) {
          continue;
        }
        const info = infoByMessageId.get(messageId) ?? {
          ownerId: workspaceMemberId,
          fromIsMember: false,
        };
        if (role === 'FROM') {
          info.ownerId = workspaceMemberId;
          info.fromIsMember = true;
        }
        infoByMessageId.set(messageId, info);
      }

      after = messageParticipants?.pageInfo.hasNextPage
        ? (messageParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return infoByMessageId;
};

const collectCalendarOwners = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<Map<string, string>> => {
  const ownerByCalendarEventId = new Map<string, string>();

  for (const ids of chunk(calendarEventIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { calendarEventParticipants } = await executeWithRetry(() =>
        client.query({
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
        }),
      );

      for (const edge of calendarEventParticipants?.edges ?? []) {
        const { calendarEventId, isOrganizer, workspaceMemberId } = edge.node;
        if (
          calendarEventId &&
          workspaceMemberId &&
          (!ownerByCalendarEventId.has(calendarEventId) || isOrganizer === true)
        ) {
          ownerByCalendarEventId.set(calendarEventId, workspaceMemberId);
        }
      }

      after = calendarEventParticipants?.pageInfo.hasNextPage
        ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return ownerByCalendarEventId;
};

const foldEmail = (
  agg: PersonAgg,
  receivedAt: string,
  messageId: string,
  info: MessageMemberInfo | undefined,
): void => {
  if (!agg.lastEmail || receivedAt > agg.lastEmail.at) {
    agg.lastEmail = { at: receivedAt, id: messageId };
  }
  if (info?.fromIsMember) {
    if (!agg.lastOutboundAt || receivedAt > agg.lastOutboundAt) {
      agg.lastOutboundAt = receivedAt;
    }
  } else if (!agg.lastInboundAt || receivedAt > agg.lastInboundAt) {
    agg.lastInboundAt = receivedAt;
  }
  if (!agg.lastContactAt || receivedAt > agg.lastContactAt) {
    agg.lastContactAt = receivedAt;
    agg.lastContactById = info?.ownerId ?? null;
    agg.item = { kind: 'email', id: messageId };
  }
};

const foldMeeting = (
  agg: PersonAgg,
  startsAt: string,
  calendarEventId: string,
  ownerId: string | null,
): void => {
  if (!agg.lastMeeting || startsAt > agg.lastMeeting.at) {
    agg.lastMeeting = { at: startsAt, id: calendarEventId };
  }
  if (!agg.lastOutboundAt || startsAt > agg.lastOutboundAt) {
    agg.lastOutboundAt = startsAt;
  }
  if (!agg.lastInboundAt || startsAt > agg.lastInboundAt) {
    agg.lastInboundAt = startsAt;
  }
  if (!agg.lastContactAt || startsAt > agg.lastContactAt) {
    agg.lastContactAt = startsAt;
    agg.lastContactById = ownerId;
    agg.item = { kind: 'meeting', id: calendarEventId };
  }
};

// Aggregates every email and meeting interaction of the given people into one
// last-contact snapshot per person, resolving the owning team member and the
// inbound/outbound direction from the message and calendar participants.
export const buildPersonAggregates = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<Map<string, PersonAgg>> => {
  const aggByPersonId = new Map<string, PersonAgg>();

  if (personIds.length === 0) {
    return aggByPersonId;
  }

  const [emails, meetings] = await Promise.all([
    collectEmailInteractions(client, personIds),
    collectMeetingInteractions(client, personIds),
  ]);

  const messageIds = [...new Set(emails.map((email) => email.messageId))];
  const calendarEventIds = [
    ...new Set(meetings.map((meeting) => meeting.calendarEventId)),
  ];

  const [messageMemberInfo, calendarOwners] = await Promise.all([
    collectMessageMemberInfo(client, messageIds),
    collectCalendarOwners(client, calendarEventIds),
  ]);

  const aggFor = (personId: string): PersonAgg => {
    const existing = aggByPersonId.get(personId);
    if (existing) {
      return existing;
    }
    const created: PersonAgg = {};
    aggByPersonId.set(personId, created);
    return created;
  };

  for (const email of emails) {
    foldEmail(
      aggFor(email.personId),
      email.receivedAt,
      email.messageId,
      messageMemberInfo.get(email.messageId),
    );
  }
  for (const meeting of meetings) {
    foldMeeting(
      aggFor(meeting.personId),
      meeting.startsAt,
      meeting.calendarEventId,
      calendarOwners.get(meeting.calendarEventId) ?? null,
    );
  }

  return aggByPersonId;
};

export const pickPersonLastContact = (
  agg: PersonAgg | undefined,
): LastContact | undefined =>
  agg?.lastContactAt && agg.item
    ? { at: agg.lastContactAt, item: agg.item }
    : undefined;

export const pickLatestLastContact = (
  contacts: LastContact[],
): LastContact | undefined =>
  contacts.reduce<LastContact | undefined>(
    (latest, contact) =>
      !latest || contact.at > latest.at ? contact : latest,
    undefined,
  );

export const buildPersonUpdateData = (agg: PersonAgg): PersonUpdateData => ({
  ...(agg.lastContactAt
    ? {
        lastContactAt: agg.lastContactAt,
        lastContactById: agg.lastContactById ?? null,
      }
    : {}),
  ...(agg.lastOutboundAt ? { lastOutboundAt: agg.lastOutboundAt } : {}),
  ...(agg.lastInboundAt ? { lastInboundAt: agg.lastInboundAt } : {}),
  ...(agg.lastEmail ? { lastEmailId: agg.lastEmail.id } : {}),
  ...(agg.lastMeeting ? { lastMeetingId: agg.lastMeeting.id } : {}),
  ...(agg.item?.kind === 'email'
    ? {
        lastContactItemMessageId: agg.item.id,
        lastContactItemCalendarEventId: null,
      }
    : agg.item?.kind === 'meeting'
      ? {
          lastContactItemCalendarEventId: agg.item.id,
          lastContactItemMessageId: null,
        }
      : {}),
});

export const buildRelatedUpdateData = ({
  at,
  item,
}: LastContact): PersonUpdateData => ({
  lastContactAt: at,
  lastContactItemMessageId: item.kind === 'email' ? item.id : null,
  lastContactItemCalendarEventId: item.kind === 'meeting' ? item.id : null,
});
