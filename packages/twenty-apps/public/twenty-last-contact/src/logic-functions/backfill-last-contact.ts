import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;
// Kept low so update bursts stay under Cloudflare rate limiting on hosted
// workspaces; executeWithRetry absorbs the occasional 429 that still slips
// through.
const UPDATE_BATCH_SIZE = 10;

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
type LastContact = { at: string; item: ContactItem };
type OpportunityRow = {
  id: string;
  pointOfContactId: string | null;
};

type PersonAgg = {
  lastContactAt?: string;
  lastContactById?: string | null;
  item?: { kind: 'email' | 'meeting'; id: string };
  lastOutboundAt?: string;
  lastInboundAt?: string;
  lastEmail?: { at: string; id: string };
  lastMeeting?: { at: string; id: string };
};
type AggByPersonId = Map<string, PersonAgg>;

type PersonUpdateData = Record<string, string | null>;
type RecordUpdate = { id: string; data: PersonUpdateData };

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const collectEmailInteractions = async (
  client: CoreApiClient,
): Promise<EmailInteraction[]> => {
  const interactions: EmailInteraction[] = [];
  let after: string | undefined;

  do {
    const { messageParticipants } = await executeWithRetry(() =>
      client.query({
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

  return interactions;
};

const collectMeetingInteractions = async (
  client: CoreApiClient,
): Promise<MeetingInteraction[]> => {
  const now = new Date().toISOString();
  const interactions: MeetingInteraction[] = [];
  let after: string | undefined;

  do {
    const { calendarEventParticipants } = await executeWithRetry(() =>
      client.query({
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

const collectPersonCompanies = async (
  client: CoreApiClient,
): Promise<Map<string, string>> => {
  const companyByPersonId = new Map<string, string>();
  let after: string | undefined;

  do {
    const { people } = await executeWithRetry(() =>
      client.query({
        people: {
          __args: {
            filter: { companyId: { is: 'NOT_NULL' } },
            first: PAGE_SIZE,
            after,
          },
          edges: { node: { id: true, companyId: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    for (const edge of people?.edges ?? []) {
      const { id, companyId } = edge.node;
      if (id && companyId) {
        companyByPersonId.set(id, companyId);
      }
    }

    after = people?.pageInfo.hasNextPage
      ? (people.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return companyByPersonId;
};

const collectOpportunities = async (
  client: CoreApiClient,
): Promise<OpportunityRow[]> => {
  const opportunities: OpportunityRow[] = [];
  let after: string | undefined;

  do {
    const { opportunities: page } = await executeWithRetry(() =>
      client.query({
        opportunities: {
          __args: { first: PAGE_SIZE, after },
          edges: {
            node: { id: true, pointOfContactId: true },
          },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      }),
    );

    for (const edge of page?.edges ?? []) {
      const { id, pointOfContactId } = edge.node;
      if (id) {
        opportunities.push({
          id,
          pointOfContactId: pointOfContactId ?? null,
        });
      }
    }

    after = page?.pageInfo.hasNextPage
      ? (page.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return opportunities;
};

const buildRelatedData = ({ at, item }: LastContact): PersonUpdateData => ({
  lastContactAt: at,
  lastContactItemMessageId: item.kind === 'email' ? item.id : null,
  lastContactItemCalendarEventId: item.kind === 'meeting' ? item.id : null,
});

const personLastContact = (agg: PersonAgg): LastContact | undefined =>
  agg.lastContactAt && agg.item
    ? { at: agg.lastContactAt, item: agg.item }
    : undefined;

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

const buildData = (agg: PersonAgg): PersonUpdateData => ({
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

const applyUpdates = async (
  client: CoreApiClient,
  mutationName: string,
  updates: RecordUpdate[],
): Promise<void> => {
  for (const batch of chunk(updates, UPDATE_BATCH_SIZE)) {
    await Promise.all(
      batch.map(({ id, data }) =>
        executeWithRetry(() =>
          client.mutation({
            [mutationName]: {
              __args: { id, data },
              id: true,
            },
          }),
        ),
      ),
    );
  }
};

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();

  const [emails, meetings, personCompanies, opportunities] = await Promise.all([
    collectEmailInteractions(client),
    collectMeetingInteractions(client),
    collectPersonCompanies(client),
    collectOpportunities(client),
  ]);

  const messageIds = [...new Set(emails.map((email) => email.messageId))];
  const calendarEventIds = [
    ...new Set(meetings.map((meeting) => meeting.calendarEventId)),
  ];

  const [messageMemberInfo, calendarOwners] = await Promise.all([
    collectMessageMemberInfo(client, messageIds),
    collectCalendarOwners(client, calendarEventIds),
  ]);

  const aggByPersonId: AggByPersonId = new Map();
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

  const personUpdates = [...aggByPersonId.entries()].map(([personId, agg]) => ({
    id: personId,
    data: buildData(agg),
  }));

  const companyLastContact = new Map<string, LastContact>();
  for (const [personId, agg] of aggByPersonId) {
    const contact = personLastContact(agg);
    if (!contact) {
      continue;
    }
    const companyId = personCompanies.get(personId);
    if (!companyId) {
      continue;
    }
    const existing = companyLastContact.get(companyId);
    if (!existing || contact.at > existing.at) {
      companyLastContact.set(companyId, contact);
    }
  }

  const opportunityUpdates = opportunities
    .map((opportunity): RecordUpdate | undefined => {
      const pointOfContactAgg = opportunity.pointOfContactId
        ? aggByPersonId.get(opportunity.pointOfContactId)
        : undefined;
      const lastContact = pointOfContactAgg ? personLastContact(pointOfContactAgg) : undefined;
      return lastContact
        ? { id: opportunity.id, data: buildRelatedData(lastContact) }
        : undefined;
    })
    .filter((update): update is RecordUpdate => Boolean(update));

  const companyUpdates: RecordUpdate[] = [...companyLastContact.entries()].map(
    ([companyId, contact]) => ({
      id: companyId,
      data: buildRelatedData(contact),
    }),
  );

  await applyUpdates(client, 'updatePerson', personUpdates);
  await applyUpdates(client, 'updateCompany', companyUpdates);
  await applyUpdates(client, 'updateOpportunity', opportunityUpdates);
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Fills person, company and opportunity last-contact fields from existing messages and calendar events after installation.',
  timeoutSeconds: 300,
  shouldRunOnVersionUpgrade: true,
  handler,
});
