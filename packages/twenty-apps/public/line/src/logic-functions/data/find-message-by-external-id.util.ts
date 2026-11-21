import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findMessageByExternalId = async ({
  client,
  messageChannelId,
  externalId,
}: {
  client: CoreApiClient;
  messageChannelId: string;
  externalId: string;
}): Promise<{ id: string } | undefined> => {
  const { messageChannelMessageAssociations } = await client.query({
    messageChannelMessageAssociations: {
      __args: {
        filter: {
          messageChannelId: { eq: messageChannelId },
          messageExternalId: { eq: externalId },
        },
        first: 1,
      },
      edges: { node: { message: { id: true } } },
    },
  });

  return messageChannelMessageAssociations?.edges[0]?.node.message ?? undefined;
};
