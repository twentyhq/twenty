import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

type LatestIncomingWhatsAppMessage = {
  externalId: string;
  receivedAt: Date;
};

export const findLatestIncomingWhatsAppMessage = async ({
  messageChannelId,
  threadExternalId,
}: {
  messageChannelId: string;
  threadExternalId: string;
}): Promise<LatestIncomingWhatsAppMessage | undefined> => {
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
      edges: { node: { messageExternalId: true, message: { receivedAt: true } } },
    },
  });
  const node: { messageExternalId: string | null; message: { receivedAt: string | null } | null } | undefined =
    messageChannelMessageAssociations?.edges[0]?.node;

  if (!isDefined(node?.messageExternalId) || !isDefined(node.message?.receivedAt)) {
    return undefined;
  }

  return { externalId: node.messageExternalId, receivedAt: new Date(node.message.receivedAt) };
};
