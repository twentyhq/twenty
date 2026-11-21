import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

// the history import stores up to 20 older messages after live ones, so the newest stored is not always the newest sent
const RECENTLY_STORED_INCOMING_MESSAGES_LIMIT = 25;

type IncomingAssociationNode = {
  message: { receivedAt: string | null } | null;
};

export const findLastCustomerMessageAt = async ({
  messageChannelId,
  threadExternalId,
}: {
  messageChannelId: string;
  threadExternalId: string;
}): Promise<Date | undefined> => {
  const { messageChannelMessageAssociations } =
    await new CoreApiClient().query({
      messageChannelMessageAssociations: {
        __args: {
          filter: {
            messageChannelId: { eq: messageChannelId },
            messageThreadExternalId: { eq: threadExternalId },
            direction: { eq: 'INCOMING' },
          },
          orderBy: [{ createdAt: 'DescNullsLast' }],
          first: RECENTLY_STORED_INCOMING_MESSAGES_LIMIT,
        },
        edges: { node: { message: { receivedAt: true } } },
      },
    });

  const sentTimes = (messageChannelMessageAssociations?.edges ?? []).flatMap(
    ({ node }: { node: IncomingAssociationNode }) =>
      isDefined(node.message?.receivedAt)
        ? [new Date(node.message.receivedAt).getTime()]
        : [],
  );

  return sentTimes.length > 0 ? new Date(Math.max(...sentTimes)) : undefined;
};
