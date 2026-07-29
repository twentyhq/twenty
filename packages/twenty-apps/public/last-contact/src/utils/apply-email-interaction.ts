import { type CoreApiClient } from 'twenty-client-sdk/core';

import { pickContactTeamMemberId } from 'src/utils/pick-contact-team-member';
import { updatePersonForInteraction } from 'src/utils/update-person-last-contact';
import { updateRelatedLastContact } from 'src/utils/update-related-last-contact';

const PARTICIPANTS_PAGE_SIZE = 200;

type MessageParticipantNode = {
  role: string | null;
  workspaceMemberId: string | null;
  message: { receivedAt: string | null } | null;
};

export const applyEmailInteraction = async (
  client: CoreApiClient,
  { personId, messageId }: { personId: string; messageId: string },
): Promise<void> => {
  const { messageParticipants } = await client.query({
    messageParticipants: {
      __args: {
        filter: { messageId: { eq: messageId } },
        first: PARTICIPANTS_PAGE_SIZE,
      },
      edges: {
        node: {
          role: true,
          workspaceMemberId: true,
          message: { receivedAt: true },
        },
      },
    },
  });

  const participants =
    messageParticipants?.edges?.map(
      (edge: { node: MessageParticipantNode }) => edge.node,
    ) ?? [];
  const occurredAt = participants[0]?.message?.receivedAt ?? null;

  if (!occurredAt) {
    return;
  }

  const fromParticipant = participants.find(
    (participant: MessageParticipantNode) => participant.role === 'FROM',
  );
  const direction = fromParticipant?.workspaceMemberId ? 'outbound' : 'inbound';
  const workspaceMemberId = pickContactTeamMemberId(participants, {
    role: 'FROM',
  });

  await updatePersonForInteraction(client, {
    personId,
    occurredAt,
    kind: 'email',
    itemId: messageId,
    workspaceMemberId,
    direction,
  });

  await updateRelatedLastContact(client, {
    personId,
    occurredAt,
    itemId: messageId,
    kind: 'email',
  });
};
