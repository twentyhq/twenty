import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createPacedApiClient, type PacedApiClient } from 'src/utils/paced-api-client';

const PAGE_SIZE = 200;
// The server counts one rate-limiting token per GraphQL root field whatever the
// payload size, and caps createMany at QUERY_MAX_RECORDS, so filling the batch
// is what keeps a whole-workspace backfill inside the application rate limit.
const UPSERT_BATCH_SIZE = 200;

type EmailLink = { personId: string; messageId: string; receivedAt: string };
type MeetingLink = {
  personId: string;
  calendarEventId: string;
  startsAt: string;
};
type MessageMemberInfo = { ownerId: string | null; fromIsMember: boolean };
type ContactItem = { kind: 'email' | 'meeting'; id: string };
type LastContact = { at: string; item: ContactItem };

type RecordData = Record<string, string | null>;
type RecordUpdate = { id: string; data: RecordData };

type PersonSnapshot = {
  companyId: string | null;
  lastContactAt: string | null;
  lastContactById: string | null;
  lastOutboundAt: string | null;
  lastInboundAt: string | null;
  lastEmailId: string | null;
  lastMeetingId: string | null;
  lastContactItemMessageId: string | null;
  lastContactItemCalendarEventId: string | null;
};
type RelatedSnapshot = {
  lastContactAt: string | null;
  lastContactItemMessageId: string | null;
  lastContactItemCalendarEventId: string | null;
};
type PersonNode = ({ id?: string | null } & Partial<PersonSnapshot>) | null;

type OpportunityRow = {
  id: string;
  pointOfContactId: string;
  snapshot: RelatedSnapshot;
};

type PersonAgg = {
  lastContactAt?: string;
  lastContactById?: string | null;
  item?: ContactItem;
  lastOutboundAt?: string;
  lastInboundAt?: string;
  lastEmail?: { at: string; id: string };
  lastMeeting?: { at: string; id: string };
};
type AggByPersonId = Map<string, PersonAgg>;

const PERSON_SNAPSHOT_SELECTION = {
  id: true,
  companyId: true,
  lastContactAt: true,
  lastContactById: true,
  lastOutboundAt: true,
  lastInboundAt: true,
  lastEmailId: true,
  lastMeetingId: true,
  lastContactItemMessageId: true,
  lastContactItemCalendarEventId: true,
} as const;

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const storePersonSnapshot = (
  snapshotByPersonId: Map<string, PersonSnapshot>,
  person: PersonNode,
): void => {
  if (!person?.id || snapshotByPersonId.has(person.id)) {
    return;
  }

  snapshotByPersonId.set(person.id, {
    companyId: person.companyId ?? null,
    lastContactAt: person.lastContactAt ?? null,
    lastContactById: person.lastContactById ?? null,
    lastOutboundAt: person.lastOutboundAt ?? null,
    lastInboundAt: person.lastInboundAt ?? null,
    lastEmailId: person.lastEmailId ?? null,
    lastMeetingId: person.lastMeetingId ?? null,
    lastContactItemMessageId: person.lastContactItemMessageId ?? null,
    lastContactItemCalendarEventId:
      person.lastContactItemCalendarEventId ?? null,
  });
};

// Paging every participant rather than only the ones linked to a person costs a
// few extra pages but yields the message's sender and owning workspace member
// from the same rows, removing a second chunked pass over every message.
const collectEmailInteractions = async (
  client: PacedApiClient,
  snapshotByPersonId: Map<string, PersonSnapshot>,
): Promise<{
  links: EmailLink[];
  memberInfoByMessageId: Map<string, MessageMemberInfo>;
}> => {
  const links: EmailLink[] = [];
  const memberInfoByMessageId = new Map<string, MessageMemberInfo>();
  let after: string | undefined;

  do {
    const { messageParticipants } = await client.query({
      messageParticipants: {
        __args: { first: PAGE_SIZE, after },
        edges: {
          node: {
            personId: true,
            role: true,
            workspaceMemberId: true,
            message: { id: true, receivedAt: true },
            person: PERSON_SNAPSHOT_SELECTION,
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of messageParticipants?.edges ?? []) {
      const { personId, role, workspaceMemberId, message, person } = edge.node;

      if (!message?.id || !message?.receivedAt) {
        continue;
      }

      if (workspaceMemberId) {
        const info = memberInfoByMessageId.get(message.id) ?? {
          ownerId: null,
          fromIsMember: false,
        };

        if (!info.ownerId || role === 'FROM') {
          info.ownerId = workspaceMemberId;
        }
        if (role === 'FROM') {
          info.fromIsMember = true;
        }

        memberInfoByMessageId.set(message.id, info);
      }

      if (personId) {
        links.push({
          personId,
          messageId: message.id,
          receivedAt: message.receivedAt,
        });
        storePersonSnapshot(snapshotByPersonId, person);
      }
    }

    after = messageParticipants?.pageInfo.hasNextPage
      ? (messageParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return { links, memberInfoByMessageId };
};

const collectMeetingInteractions = async (
  client: PacedApiClient,
  snapshotByPersonId: Map<string, PersonSnapshot>,
): Promise<{
  links: MeetingLink[];
  ownerByCalendarEventId: Map<string, string>;
}> => {
  const now = new Date().toISOString();
  const links: MeetingLink[] = [];
  const ownerByCalendarEventId = new Map<string, string>();
  let after: string | undefined;

  do {
    const { calendarEventParticipants } = await client.query({
      calendarEventParticipants: {
        __args: { first: PAGE_SIZE, after },
        edges: {
          node: {
            personId: true,
            isOrganizer: true,
            workspaceMemberId: true,
            calendarEvent: { id: true, startsAt: true, isCanceled: true },
            person: PERSON_SNAPSHOT_SELECTION,
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of calendarEventParticipants?.edges ?? []) {
      const { personId, isOrganizer, workspaceMemberId, calendarEvent, person } =
        edge.node;

      if (
        !calendarEvent?.id ||
        !calendarEvent?.startsAt ||
        calendarEvent.isCanceled ||
        calendarEvent.startsAt > now
      ) {
        continue;
      }

      if (
        workspaceMemberId &&
        (!ownerByCalendarEventId.has(calendarEvent.id) || isOrganizer === true)
      ) {
        ownerByCalendarEventId.set(calendarEvent.id, workspaceMemberId);
      }

      if (personId) {
        links.push({
          personId,
          calendarEventId: calendarEvent.id,
          startsAt: calendarEvent.startsAt,
        });
        storePersonSnapshot(snapshotByPersonId, person);
      }
    }

    after = calendarEventParticipants?.pageInfo.hasNextPage
      ? (calendarEventParticipants.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return { links, ownerByCalendarEventId };
};

const collectOpportunities = async (
  client: PacedApiClient,
): Promise<OpportunityRow[]> => {
  const opportunities: OpportunityRow[] = [];
  let after: string | undefined;

  do {
    const { opportunities: page } = await client.query({
      opportunities: {
        __args: {
          filter: { pointOfContactId: { is: 'NOT_NULL' } },
          first: PAGE_SIZE,
          after,
        },
        edges: {
          node: {
            id: true,
            pointOfContactId: true,
            lastContactAt: true,
            lastContactItemMessageId: true,
            lastContactItemCalendarEventId: true,
          },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of page?.edges ?? []) {
      const {
        id,
        pointOfContactId,
        lastContactAt,
        lastContactItemMessageId,
        lastContactItemCalendarEventId,
      } = edge.node;

      if (id && pointOfContactId) {
        opportunities.push({
          id,
          pointOfContactId,
          snapshot: {
            lastContactAt: lastContactAt ?? null,
            lastContactItemMessageId: lastContactItemMessageId ?? null,
            lastContactItemCalendarEventId:
              lastContactItemCalendarEventId ?? null,
          },
        });
      }
    }

    after = page?.pageInfo.hasNextPage
      ? (page.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (after);

  return opportunities;
};

const buildRelatedData = ({ at, item }: LastContact): RecordData => ({
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

const buildData = (agg: PersonAgg): RecordData => ({
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

// The backfill re-runs on every version upgrade, where most records already
// hold the value it would write. An unknown snapshot means the record was never
// read, so it is always written.
const hasChanges = (
  data: RecordData,
  snapshot: RecordData | undefined,
): boolean =>
  !snapshot ||
  Object.entries(data).some(
    ([field, value]) => (snapshot[field] ?? null) !== value,
  );

// createMany with upsert matches on the provided id and applies a distinct
// payload per record, so 200 records cost one API call instead of 200.
const applyUpserts = async (
  client: PacedApiClient,
  mutationName: string,
  updates: RecordUpdate[],
): Promise<void> => {
  for (const batch of chunk(updates, UPSERT_BATCH_SIZE)) {
    await client.mutation({
      [mutationName]: {
        __args: {
          data: batch.map(({ id, data }) => ({ id, ...data })),
          upsert: true,
        },
        id: true,
      },
    });
  }
};

const handler = async (): Promise<void> => {
  const client = createPacedApiClient(new CoreApiClient());
  const snapshotByPersonId = new Map<string, PersonSnapshot>();

  const [emails, meetings, opportunities] = await Promise.all([
    collectEmailInteractions(client, snapshotByPersonId),
    collectMeetingInteractions(client, snapshotByPersonId),
    collectOpportunities(client),
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

  for (const email of emails.links) {
    foldEmail(
      aggFor(email.personId),
      email.receivedAt,
      email.messageId,
      emails.memberInfoByMessageId.get(email.messageId),
    );
  }
  for (const meeting of meetings.links) {
    foldMeeting(
      aggFor(meeting.personId),
      meeting.startsAt,
      meeting.calendarEventId,
      meetings.ownerByCalendarEventId.get(meeting.calendarEventId) ?? null,
    );
  }

  const personUpdates: RecordUpdate[] = [];
  const companyLastContact = new Map<string, LastContact>();

  for (const [personId, agg] of aggByPersonId) {
    const data = buildData(agg);

    if (hasChanges(data, snapshotByPersonId.get(personId))) {
      personUpdates.push({ id: personId, data });
    }

    const contact = personLastContact(agg);
    const companyId = snapshotByPersonId.get(personId)?.companyId;

    if (!contact || !companyId) {
      continue;
    }

    const existing = companyLastContact.get(companyId);
    if (!existing || contact.at > existing.at) {
      companyLastContact.set(companyId, contact);
    }
  }

  const companyUpdates: RecordUpdate[] = [...companyLastContact.entries()].map(
    ([companyId, contact]) => ({
      id: companyId,
      data: buildRelatedData(contact),
    }),
  );

  const opportunityUpdates = opportunities.reduce<RecordUpdate[]>(
    (updates, opportunity) => {
      const agg = aggByPersonId.get(opportunity.pointOfContactId);
      const lastContact = agg ? personLastContact(agg) : undefined;

      if (!lastContact) {
        return updates;
      }

      const data = buildRelatedData(lastContact);

      if (hasChanges(data, opportunity.snapshot)) {
        updates.push({ id: opportunity.id, data });
      }

      return updates;
    },
    [],
  );

  await applyUpserts(client, 'createPeople', personUpdates);
  await applyUpserts(client, 'createCompanies', companyUpdates);
  await applyUpserts(client, 'createOpportunities', opportunityUpdates);
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Fills person, company and opportunity last-contact fields from existing messages and calendar events after installation.',
  timeoutSeconds: 900,
  shouldRunOnVersionUpgrade: true,
  handler,
});
