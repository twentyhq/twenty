import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { chunk } from 'src/utils/chunk';
import {
  buildMessageInteraction,
  MESSAGE_SELECTION,
  type MessageNode,
  type MessageParticipantNode,
} from 'src/utils/collect-message-interactions';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import { type InteractionKind } from 'src/utils/update-person-last-contact';

const PAGE_SIZE = 200;

type EmailInteraction = {
  personId: string;
  messageId: string;
  message: MessageNode;
};
type MeetingInteraction = {
  personId: string;
  calendarEventId: string;
  startsAt: string;
};
type ContactItem = { kind: InteractionKind; id: string };

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
                message: { id: true, ...MESSAGE_SELECTION },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of messageParticipants?.edges ?? []) {
        const { personId, message } = edge.node as {
          personId?: string | null;
          message?: (MessageNode & { id?: string | null }) | null;
        };
        if (isDefined(personId) && isDefined(message?.id)) {
          interactions.push({ personId, messageId: message.id, message });
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

const collectTeamMemberParticipants = async (
  client: CoreApiClient,
  messageIds: string[],
): Promise<Map<string, MessageParticipantNode[]>> => {
  const participantsByMessageId = new Map<string, MessageParticipantNode[]>();

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
        const participant = edge.node as MessageParticipantNode;
        const messageId = participant.messageId;
        if (!messageId) {
          continue;
        }
        participantsByMessageId.set(messageId, [
          ...(participantsByMessageId.get(messageId) ?? []),
          participant,
        ]);
      }

      after = messageParticipants?.pageInfo.hasNextPage
        ? (messageParticipants.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return participantsByMessageId;
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

const foldMessage = (
  agg: PersonAgg,
  email: EmailInteraction,
  participants: MessageParticipantNode[],
): void => {
  const interaction = buildMessageInteraction(email.message, participants);

  if (!interaction) {
    return;
  }

  const { receivedAt } = interaction;

  if (
    interaction.kind === 'email' &&
    (!agg.lastEmail || receivedAt > agg.lastEmail.at)
  ) {
    agg.lastEmail = { at: receivedAt, id: email.messageId };
  }
  if (interaction.direction === 'outbound') {
    if (!agg.lastOutboundAt || receivedAt > agg.lastOutboundAt) {
      agg.lastOutboundAt = receivedAt;
    }
  } else if (!agg.lastInboundAt || receivedAt > agg.lastInboundAt) {
    agg.lastInboundAt = receivedAt;
  }
  if (!agg.lastContactAt || receivedAt > agg.lastContactAt) {
    agg.lastContactAt = receivedAt;
    agg.lastContactById = interaction.workspaceMemberId;
    agg.item = { kind: interaction.kind, id: email.messageId };
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

// Aggregates every message (email or app chat) and meeting interaction of the given people into one
// last-contact snapshot per person, resolving the owning team member and the
// inbound/outbound direction from the participants and channel associations.
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

  const [teamMemberParticipantsByMessageId, calendarOwners] = await Promise.all(
    [
      collectTeamMemberParticipants(client, messageIds),
      collectCalendarOwners(client, calendarEventIds),
    ],
  );

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
    foldMessage(
      aggFor(email.personId),
      email,
      teamMemberParticipantsByMessageId.get(email.messageId) ?? [],
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

export const buildPersonUpdateData = (
  agg: PersonAgg | undefined,
): PersonUpdateData => ({
  lastContactAt: agg?.lastContactAt ?? null,
  lastContactById: agg?.lastContactById ?? null,
  lastOutboundAt: agg?.lastOutboundAt ?? null,
  lastInboundAt: agg?.lastInboundAt ?? null,
  lastEmailId: agg?.lastEmail?.id ?? null,
  lastMeetingId: agg?.lastMeeting?.id ?? null,
  lastContactItemMessageId:
    isDefined(agg?.item) && agg.item.kind !== 'meeting' ? agg.item.id : null,
  lastContactItemCalendarEventId:
    agg?.item?.kind === 'meeting' ? agg.item.id : null,
});

export const PERSON_LAST_CONTACT_FIELD_NAMES = Object.keys(
  buildPersonUpdateData(undefined),
);
