import { defineLogicFunction, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';
import type { DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { pickContactTeamMemberId } from 'src/utils/pick-contact-team-member';
import { updatePersonLastContactIfNewer } from 'src/utils/update-person-last-contact-at';

type MessageParticipantUpdate = {
  personId?: string | null;
  messageId?: string | null;
};

type MessageParticipantNode = {
  role: string | null;
  workspaceMemberId: string | null;
};

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<MessageParticipantUpdate>>,
): Promise<void> => {
  const personId = event.properties.after.personId;
  const messageId = event.properties.after.messageId;

  if (!personId || !messageId) {
    return;
  }

  const client = new CoreApiClient();

  const { message } = await client.query({
    message: {
      __args: { filter: { id: { eq: messageId } } },
      id: true,
      receivedAt: true,
      messageParticipants: {
        edges: {
          node: {
            role: true,
            workspaceMemberId: true,
          },
        },
      },
    },
  });

  const lastContactAt = message?.receivedAt ?? null;

  if (!lastContactAt) {
    return;
  }

  const participants =
    message?.messageParticipants?.edges?.map(
      (edge: { node: MessageParticipantNode }) => edge.node,
    ) ?? [];
  const workspaceMemberId = pickContactTeamMemberId(participants, {
    role: 'from',
  });

  await updatePersonLastContactIfNewer(client, {
    personId,
    lastContactAt,
    workspaceMemberId,
    item: { type: 'message', id: messageId },
  });
};

export default defineLogicFunction({
  universalIdentifier: EMAIL_INTERACTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-email-interaction',
  description:
    "Updates a person's last-contacted fields when a new email participant is created.",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'messageParticipant.updated',
    updatedFields: ['personId'],
  },
  handler,
});
