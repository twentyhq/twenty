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
      lastInteractionAt: true,
      lastContactedAt: true,
      lastEngagementAt: true,
      lastEmail: { receivedAt: true },
      lastMeeting: { startsAt: true },
    },
  });

  const current = (person ?? {}) as {
    lastInteractionAt?: string | null;
    lastContactedAt?: string | null;
    lastEngagementAt?: string | null;
    lastEmail?: { receivedAt: string | null } | null;
    lastMeeting?: { startsAt: string | null } | null;
  };

  const data: Record<string, string | null> = {};

  if (isNewer(occurredAt, current.lastInteractionAt)) {
    data.lastInteractionAt = occurredAt;
    if (workspaceMemberId) {
      data.lastOwnerId = workspaceMemberId;
    }
    if (kind === 'email') {
      data.lastContactItemMessageId = itemId;
      data.lastContactItemCalendarEventId = null;
    } else {
      data.lastContactItemCalendarEventId = itemId;
      data.lastContactItemMessageId = null;
    }
  }

  const touchesContacted =
    interaction.kind === 'meeting' || interaction.direction === 'outbound';
  const touchesEngagement =
    interaction.kind === 'meeting' || interaction.direction === 'inbound';

  if (touchesContacted && isNewer(occurredAt, current.lastContactedAt)) {
    data.lastContactedAt = occurredAt;
  }
  if (touchesEngagement && isNewer(occurredAt, current.lastEngagementAt)) {
    data.lastEngagementAt = occurredAt;
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

  await client.mutation({
    updatePerson: {
      __args: { id: personId, data },
      id: true,
    },
  });
};
