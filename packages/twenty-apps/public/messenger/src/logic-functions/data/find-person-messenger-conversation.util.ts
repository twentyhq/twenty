import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { listMessageChannels } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type MessengerConversation } from 'src/logic-functions/types/messenger-conversation.type';

const PARTICIPATIONS_LIMIT = 200;

type AssociationNode = {
  direction: 'INCOMING' | 'OUTGOING';
  messageChannelId: string;
  messageThreadExternalId: string | null;
  message: {
    text: string | null;
    receivedAt: string | null;
    messengerStatus: string | null;
  } | null;
};

// the person's latest Messenger messages across every Page, oldest first
export const findPersonMessengerConversation = async ({
  personId,
  limit,
}: {
  personId: string;
  limit: number;
}): Promise<MessengerConversation> => {
  const client = new CoreApiClient();
  const { messageParticipants } = await client.query({
    messageParticipants: {
      __args: {
        filter: { personId: { eq: personId } },
        first: PARTICIPATIONS_LIMIT,
      },
      edges: { node: { messageId: true } },
    },
  });
  const messageIds: string[] = (messageParticipants?.edges ?? [])
    .map(({ node }: { node: { messageId: string | null } }) => node.messageId)
    .filter(isNonEmptyString);
  const messageChannels = await listMessageChannels();

  if (messageIds.length === 0 || messageChannels.length === 0) {
    return { messages: [], latestThread: undefined };
  }

  const { messageChannelMessageAssociations } = await client.query({
    messageChannelMessageAssociations: {
      __args: {
        filter: {
          messageId: { in: [...new Set(messageIds)] },
          messageChannelId: { in: messageChannels.map(({ id }) => id) },
        },
        first: PARTICIPATIONS_LIMIT,
      },
      edges: {
        node: {
          direction: true,
          messageChannelId: true,
          messageThreadExternalId: true,
          message: { text: true, receivedAt: true, messengerStatus: true },
        },
      },
    },
  });

  const nodes: AssociationNode[] = (
    messageChannelMessageAssociations?.edges ?? []
  )
    .map(({ node }: { node: AssociationNode }) => node)
    .sort((first: AssociationNode, second: AssociationNode) =>
      (first.message?.receivedAt ?? '').localeCompare(
        second.message?.receivedAt ?? '',
      ),
    );

  const latestNode = nodes[nodes.length - 1];
  const latestMessageChannel = messageChannels.find(
    ({ id }) => id === latestNode?.messageChannelId,
  );

  return {
    messages: nodes.slice(-limit).map((node) => ({
      sentAt: node.message?.receivedAt ?? null,
      direction: node.direction,
      text: node.message?.text ?? '',
      status: node.message?.messengerStatus ?? null,
    })),
    latestThread:
      isDefined(latestMessageChannel) &&
      isNonEmptyString(latestNode?.messageThreadExternalId)
        ? {
            connectedAccountId: latestMessageChannel.connectedAccountId,
            messageChannelId: latestMessageChannel.id,
            pageHandle: latestMessageChannel.handle,
            threadExternalId: latestNode.messageThreadExternalId,
          }
        : undefined,
  };
};
