import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { type WhatsappMessageChannel } from 'src/logic-functions/types/whatsapp-message-channel.type';

export const fetchWhatsappMessageChannels = async ({
  metadataClient = new MetadataApiClient(),
}: {
  metadataClient?: MetadataApiClient;
} = {}): Promise<WhatsappMessageChannel[]> => {
  const { appConnectedAccounts } = await metadataClient.query({
    appConnectedAccounts: {
      id: true,
      handle: true,
      messageChannels: {
        id: true,
        type: true,
      },
    },
  });

  return appConnectedAccounts.flatMap((connectedAccount) =>
    connectedAccount.messageChannels
      .filter((messageChannel) => messageChannel.type === 'APP')
      .map((messageChannel) => ({
        messageChannelId: messageChannel.id,
        connectedAccountId: connectedAccount.id,
        connectedAccountHandle: connectedAccount.handle,
      })),
  );
};
