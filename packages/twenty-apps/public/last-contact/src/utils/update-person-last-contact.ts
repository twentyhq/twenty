import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';

export type InteractionKind = 'email' | 'meeting';
export type InteractionDirection = 'outbound' | 'inbound';

export type Interaction = {
  occurredAt: string;
  itemId: string;
  workspaceMemberId: string | null;
} & ({ kind: 'email'; direction: InteractionDirection } | { kind: 'meeting' });

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

export const updatePersonForInteractions = async (
  client: CoreApiClient,
  personId: string,
  interactions: Interaction[],
): Promise<void> => {
  const latestContact = pickLatest(interactions);

  if (!latestContact) {
    return;
  }

  const { person } = await executeWithRetry(() =>
    client.query({
      person: {
        __args: { filter: { id: { eq: personId } } },
        id: true,
        lastContactAt: true,
        lastOutboundAt: true,
        lastInboundAt: true,
        lastEmail: { receivedAt: true },
        lastMeeting: { startsAt: true },
      },
    }),
  );

  const current = (person ?? {}) as {
    lastContactAt?: string | null;
    lastOutboundAt?: string | null;
    lastInboundAt?: string | null;
    lastEmail?: { receivedAt: string | null } | null;
    lastMeeting?: { startsAt: string | null } | null;
  };

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
    return;
  }

  if ('lastContactAt' in data) {
    const { updatePeople } = await executeWithRetry(() =>
      client.mutation({
        updatePeople: {
          __args: {
            data,
            filter: {
              and: [
                { id: { eq: personId } },
                {
                  or: [
                    { lastContactAt: { is: 'NULL' } },
                    { lastContactAt: { lt: occurredAt } },
                  ],
                },
              ],
            },
          },
          id: true,
        },
      }),
    );

    if (Array.isArray(updatePeople) && updatePeople.length > 0) {
      return;
    }

    const directionalData: Record<string, string | null> = { ...data };
    delete directionalData.lastContactAt;
    delete directionalData.lastContactById;
    delete directionalData.lastContactItemMessageId;
    delete directionalData.lastContactItemCalendarEventId;

    if (Object.keys(directionalData).length === 0) {
      return;
    }

    await executeWithRetry(() =>
      client.mutation({
        updatePerson: {
          __args: { id: personId, data: directionalData },
          id: true,
        },
      }),
    );
    return;
  }

  await executeWithRetry(() =>
    client.mutation({
      updatePerson: {
        __args: { id: personId, data },
        id: true,
      },
    }),
  );
};
