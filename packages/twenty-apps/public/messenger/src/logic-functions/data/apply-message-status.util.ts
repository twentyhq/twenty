import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type MessengerMessageStatus } from 'src/logic-functions/types/messenger-message-status.type';
import { selectMessagesToMark } from 'src/logic-functions/data/select-messages-to-mark.util';
import { type OutgoingMessage } from 'src/logic-functions/types/outgoing-message.type';

// receipts only matter for recent messages; older ones were marked by earlier receipts
const RECENT_OUTGOING_MESSAGES_LIMIT = 50;

type AssociationNode = {
  messageExternalId: string | null;
  message: {
    id: string;
    receivedAt: string | null;
    messengerStatus: string | null;
  } | null;
};

export const applyMessageStatus = async ({
  client,
  messageChannelId,
  threadExternalId,
  status,
  watermark,
  mids,
}: {
  client: CoreApiClient;
  messageChannelId: string;
  threadExternalId: string;
  status: MessengerMessageStatus;
  watermark: number;
  mids?: string[];
}) => {
  const { messageChannelMessageAssociations } = await client.query({
    messageChannelMessageAssociations: {
      __args: {
        filter: {
          messageChannelId: { eq: messageChannelId },
          messageThreadExternalId: { eq: threadExternalId },
          direction: { eq: 'OUTGOING' },
        },
        orderBy: [{ createdAt: 'DescNullsLast' }],
        first: RECENT_OUTGOING_MESSAGES_LIMIT,
      },
      edges: {
        node: {
          messageExternalId: true,
          message: { id: true, receivedAt: true, messengerStatus: true },
        },
      },
    },
  });

  const messages: OutgoingMessage[] = (
    messageChannelMessageAssociations?.edges ?? []
  ).flatMap(({ node }: { node: AssociationNode }) => {
    const { message } = node;

    return isDefined(message)
      ? [
          {
            id: message.id,
            externalId: node.messageExternalId,
            receivedAt: message.receivedAt,
            messengerStatus: message.messengerStatus,
          },
        ]
      : [];
  });

  const messageIdsToMark = selectMessagesToMark({
    messages,
    status,
    watermark,
    mids,
  }).map(({ id }) => id);

  if (messageIdsToMark.length === 0) {
    return;
  }

  await client.mutation({
    updateMessages: {
      __args: {
        filter: { id: { in: messageIdsToMark } },
        data: { messengerStatus: status },
      },
      id: true,
    },
  });
};
