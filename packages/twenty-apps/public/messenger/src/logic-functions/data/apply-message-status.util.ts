import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type MessengerMessageStatus } from 'src/constants/messenger-message-statuses.constant';
import {
  type OutgoingMessage,
  selectMessagesToMark,
} from 'src/logic-functions/data/select-messages-to-mark.util';

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
  ).flatMap(({ node }: { node: AssociationNode }) =>
    node.message === null
      ? []
      : [
          {
            id: node.message.id,
            externalId: node.messageExternalId,
            receivedAt: node.message.receivedAt,
            messengerStatus: node.message.messengerStatus,
          },
        ],
  );

  for (const message of selectMessagesToMark({
    messages,
    status,
    watermark,
    mids,
  })) {
    await client.mutation({
      updateMessage: {
        __args: { id: message.id, data: { messengerStatus: status } },
        id: true,
      },
    });
  }
};
