import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { listMessageChannels } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type MessengerConversation } from 'src/logic-functions/types/messenger-conversation.type';

const PARTICIPATIONS_PAGE_SIZE = 200;
const PARTICIPATIONS_MAX_PAGES = 5;

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

type ParticipationsPage = {
  messageIds: string[];
  endCursor: string | undefined;
};

const fetchParticipationsPage = async ({
  client,
  personId,
  after,
}: {
  client: CoreApiClient;
  personId: string;
  after: string | undefined;
}): Promise<ParticipationsPage> => {
  const { messageParticipants } = await client.query({
    messageParticipants: {
      __args: {
        filter: { personId: { eq: personId } },
        orderBy: [{ createdAt: 'DescNullsLast' }],
        first: PARTICIPATIONS_PAGE_SIZE,
        ...(isNonEmptyString(after) ? { after } : {}),
      },
      edges: { node: { messageId: true } },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  });

  return {
    messageIds: (messageParticipants?.edges ?? [])
      .map(({ node }: { node: { messageId: string | null } }) => node.messageId)
      .filter(isNonEmptyString),
    endCursor:
      messageParticipants?.pageInfo?.hasNextPage === true &&
      isNonEmptyString(messageParticipants.pageInfo.endCursor)
        ? messageParticipants.pageInfo.endCursor
        : undefined,
  };
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
  const messageChannels = await listMessageChannels();
  const nodes: AssociationNode[] = [];

  if (messageChannels.length === 0) {
    return { messages: [], latestThread: undefined };
  }

  // a person also takes part in email and other channels, so pages are read newest first until enough Messenger messages are found
  let after: string | undefined;

  for (
    let pageIndex = 0;
    pageIndex < PARTICIPATIONS_MAX_PAGES && nodes.length < limit;
    pageIndex++
  ) {
    const { messageIds, endCursor } = await fetchParticipationsPage({
      client,
      personId,
      after,
    });

    if (messageIds.length > 0) {
      const { messageChannelMessageAssociations } = await client.query({
        messageChannelMessageAssociations: {
          __args: {
            filter: {
              messageId: { in: [...new Set(messageIds)] },
              messageChannelId: { in: messageChannels.map(({ id }) => id) },
            },
            first: PARTICIPATIONS_PAGE_SIZE,
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

      nodes.push(
        ...(messageChannelMessageAssociations?.edges ?? []).map(
          ({ node }: { node: AssociationNode }) => node,
        ),
      );
    }

    if (!isDefined(endCursor)) {
      break;
    }

    after = endCursor;
  }

  nodes.sort((first, second) =>
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
