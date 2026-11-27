import { type CoreApiClient } from 'twenty-client-sdk/core';

import { applyPersonInteractions } from 'src/utils/apply-person-interactions';
import { collectMessageInteractions } from 'src/utils/collect-message-interactions';
import { type Interaction } from 'src/utils/update-person-last-contact';

export type MessageParticipantLink = {
  personId: string;
  messageId: string;
};

export type MessageParticipantEventRecord = {
  personId?: string | null;
  messageId?: string | null;
};

export const applyMessageParticipantEvents = async (
  client: CoreApiClient,
  events: { properties: { after: MessageParticipantEventRecord } }[],
): Promise<void> => {
  const linkByKey = new Map<string, MessageParticipantLink>();

  for (const event of events) {
    const { personId, messageId } = event.properties.after;

    if (personId && messageId) {
      linkByKey.set(`${personId}:${messageId}`, { personId, messageId });
    }
  }

  await applyMessageInteractions(client, [...linkByKey.values()]);
};

export const applyMessageInteractions = async (
  client: CoreApiClient,
  links: MessageParticipantLink[],
): Promise<void> => {
  const messageIds = [...new Set(links.map((link) => link.messageId))];

  if (messageIds.length === 0) {
    return;
  }

  const interactionByMessageId = await collectMessageInteractions(
    client,
    messageIds,
  );
  const interactionsByPersonId = new Map<string, Interaction[]>();

  for (const { personId, messageId } of links) {
    const message = interactionByMessageId.get(messageId);

    if (!message) {
      continue;
    }

    const interaction: Interaction = {
      kind: message.kind,
      occurredAt: message.receivedAt,
      itemId: messageId,
      workspaceMemberId: message.workspaceMemberId,
      direction: message.direction,
    };
    const interactions = interactionsByPersonId.get(personId);

    if (interactions) {
      interactions.push(interaction);
    } else {
      interactionsByPersonId.set(personId, [interaction]);
    }
  }

  await applyPersonInteractions(client, interactionsByPersonId);
};
