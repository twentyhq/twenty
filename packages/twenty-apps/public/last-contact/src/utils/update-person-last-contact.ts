import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import { type RecordUpsert } from 'src/utils/upsert-records-in-batches';

const PAGE_SIZE = 200;

export type InteractionKind = 'email' | 'meeting';
export type InteractionDirection = 'outbound' | 'inbound';

export type Interaction = {
  occurredAt: string;
  itemId: string;
  workspaceMemberId: string | null;
} & ({ kind: 'email'; direction: InteractionDirection } | { kind: 'meeting' });

export type PersonLastContactState = {
  lastContactAt?: string | null;
  lastOutboundAt?: string | null;
  lastInboundAt?: string | null;
  lastEmail?: { receivedAt: string | null } | null;
  lastMeeting?: { startsAt: string | null } | null;
};

const isNewer = (
  candidate: string,
  current: string | null | undefined,
): boolean => !current || current < candidate;

const touchesOutbound = (interaction: Interaction): boolean =>
  interaction.kind === 'meeting' || interaction.direction === 'outbound';

const touchesInbound = (interaction: Interaction): boolean =>
  interaction.kind === 'meeting' || interaction.direction === 'inbound';

const pickLatest = (
  interactions: Interaction[],
  matches: (interaction: Interaction) => boolean = () => true,
): Interaction | undefined =>
  interactions.reduce<Interaction | undefined>(
    (latest, interaction) =>
      matches(interaction) &&
      (!latest || interaction.occurredAt > latest.occurredAt)
        ? interaction
        : latest,
    undefined,
  );

export const pickLatestInteraction = (
  interactions: Interaction[],
): Interaction | undefined => pickLatest(interactions);

export const collectPersonLastContactState = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<Map<string, PersonLastContactState>> => {
  const stateByPersonId = new Map<string, PersonLastContactState>();

  for (const ids of chunk(personIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { people } = await executeWithRetry(() =>
        client.query({
          people: {
            __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
            edges: {
              node: {
                id: true,
                lastContactAt: true,
                lastOutboundAt: true,
                lastInboundAt: true,
                lastEmail: { receivedAt: true },
                lastMeeting: { startsAt: true },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of people?.edges ?? []) {
        const { id, ...state } = edge.node as PersonLastContactState & {
          id?: string | null;
        };

        if (id) {
          stateByPersonId.set(id, state);
        }
      }

      after = people?.pageInfo.hasNextPage
        ? (people.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return stateByPersonId;
};

// The recency comparison used to run server-side as a filter on the update. An
// upsert carries no filter, so it is done here against the state read in the
// same handler: a person whose stored contact is already newer is left out of
// the batch entirely.
export const buildPersonLastContactUpdate = (
  personId: string,
  current: PersonLastContactState,
  interactions: Interaction[],
): RecordUpsert | undefined => {
  const latestContact = pickLatest(interactions);

  if (!latestContact) {
    return undefined;
  }

  const data: Record<string, string | null> = {};
  const occurredAt = latestContact.occurredAt;

  if (isNewer(occurredAt, current.lastContactAt)) {
    data.lastContactAt = occurredAt;
    data.lastContactById = latestContact.workspaceMemberId ?? null;
    if (latestContact.kind === 'email') {
      data.lastContactItemMessageId = latestContact.itemId;
      data.lastContactItemCalendarEventId = null;
    } else {
      data.lastContactItemCalendarEventId = latestContact.itemId;
      data.lastContactItemMessageId = null;
    }
  }

  const latestOutbound = pickLatest(interactions, touchesOutbound);
  const latestInbound = pickLatest(interactions, touchesInbound);
  const latestEmail = pickLatest(
    interactions,
    (interaction) => interaction.kind === 'email',
  );
  const latestMeeting = pickLatest(
    interactions,
    (interaction) => interaction.kind === 'meeting',
  );

  if (
    latestOutbound &&
    isNewer(latestOutbound.occurredAt, current.lastOutboundAt)
  ) {
    data.lastOutboundAt = latestOutbound.occurredAt;
  }
  if (
    latestInbound &&
    isNewer(latestInbound.occurredAt, current.lastInboundAt)
  ) {
    data.lastInboundAt = latestInbound.occurredAt;
  }
  if (
    latestEmail &&
    isNewer(latestEmail.occurredAt, current.lastEmail?.receivedAt)
  ) {
    data.lastEmailId = latestEmail.itemId;
  }
  if (
    latestMeeting &&
    isNewer(latestMeeting.occurredAt, current.lastMeeting?.startsAt)
  ) {
    data.lastMeetingId = latestMeeting.itemId;
  }

  if (Object.keys(data).length === 0) {
    return undefined;
  }

  return { id: personId, ...data };
};
