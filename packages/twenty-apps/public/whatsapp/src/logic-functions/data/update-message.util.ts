import { type CoreApiClient } from 'twenty-client-sdk/core';

export const updateMessage = async ({
  client,
  messageId,
  text,
}: {
  client: CoreApiClient;
  messageId: string;
  text: string;
}) => {
  await client.mutation({
    updateMessage: {
      __args: { id: messageId, data: { text } },
      id: true,
    },
  });
};
