import { type CoreApiClient } from 'twenty-client-sdk/core';

export type InteractionKind = 'email' | 'meeting';
export type InteractionDirection = 'outbound' | 'inbound';

export type Interaction = {
  personId: string;
  occurredAt: string;
  itemId: string;
  workspaceMemberId: string | null;
} & ({ kind: 'email'; direction: InteractionDirection } | { kind: 'meeting' });

const isNewer = (
  candidate: string,
  current: string | null | undefined,
): boolean => !current || current < candidate;

export const updatePersonForInteraction = async (
  client: CoreApiClient,
  interaction: Interaction,
): Promise<void> => {
  const { personId, occurredAt, kind, itemId, workspaceMemberId } = interaction;

  const { person } = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      id: true,
      lastContactAt: true,
      lastOutboundAt: true,
      lastInboundAt: true,
      lastEmail: { receivedAt: true },
      lastMeeting: { startsAt: true },
    },
  });

  const current = (person ?? {}) as {
    lastContactAt?: string | null;
    lastOutboundAt?: string | null;
    lastInboundAt?: string | null;
    lastEmail?: { receivedAt: string | null } | null;
    lastMeeting?: { startsAt: string | null } | null;
  };

  const data: Record<string, string | null> = {};

  if (isNewer(occurredAt, current.lastContactAt)) {
    data.lastContactAt = occurredAt;
    data.lastContactById = workspaceMemberId ?? null;
    if (kind === 'email') {
      data.lastContactItemMessageId = itemId;
      data.lastContactItemCalendarEventId = null;
    } else {
      data.lastContactItemCalendarEventId = itemId;
      data.lastContactItemMessageId = null;
    }
  }

  const touchesOutbound =
    interaction.kind === 'meeting' || interaction.direction === 'outbound';
  const touchesInbound =
    interaction.kind === 'meeting' || interaction.direction === 'inbound';

  if (touchesOutbound && isNewer(occurredAt, current.lastOutboundAt)) {
    data.lastOutboundAt = occurredAt;
  }
  if (touchesInbound && isNewer(occurredAt, current.lastInboundAt)) {
    data.lastInboundAt = occurredAt;
  }
  if (kind === 'email' && isNewer(occurredAt, current.lastEmail?.receivedAt)) {
    data.lastEmailId = itemId;
  }
  if (kind === 'meeting' && isNewer(occurredAt, current.lastMeeting?.startsAt)) {
    data.lastMeetingId = itemId;
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  if ('lastContactAt' in data) {
    const { updatePeople } = await client.mutation({
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
    });

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

    await client.mutation({
      updatePerson: {
        __args: { id: personId, data: directionalData },
        id: true,
      },
    });
    return;
  }

  await client.mutation({
    updatePerson: {
      __args: { id: personId, data },
      id: true,
    },
  });
};
