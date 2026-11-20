import { CoreApiClient } from 'twenty-client-sdk/core';

export const findLatestIncomingWhatsAppMessageId = async ({
  messageChannelId,
  threadExternalId,
}: {
  messageChannelId: string;
  threadExternalId: string;
}): Promise<string | undefined> => {
  const { messageChannelMessageAssociations } = await new CoreApiClient().query({
    messageChannelMessageAssociations: {
      __args: {
        filter: {
          messageChannelId: { eq: messageChannelId },
          messageThreadExternalId: { eq: threadExternalId },
          direction: { eq: 'INCOMING' },
        },
        orderBy: [{ createdAt: 'DescNullsLast' }],
        first: 1,
      },
      edges: { node: { messageExternalId: true } },
    },
  });

  return messageChannelMessageAssociations?.edges[0]?.node.messageExternalId ?? undefined;
};
