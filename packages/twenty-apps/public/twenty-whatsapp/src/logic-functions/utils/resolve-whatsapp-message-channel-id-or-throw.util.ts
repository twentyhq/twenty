import { type MetadataApiClient } from 'twenty-client-sdk/metadata';

import { fetchWhatsappMessageChannels } from 'src/logic-functions/utils/fetch-whatsapp-message-channels.util';

export const resolveWhatsappMessageChannelIdOrThrow = async ({
  metadataClient,
}: {
  metadataClient?: MetadataApiClient;
} = {}): Promise<string> => {
  const whatsappMessageChannels = await fetchWhatsappMessageChannels({
    metadataClient,
  });

  if (whatsappMessageChannels.length === 0) {
    throw new Error(
      'No WhatsApp message channel found: connect a WhatsApp Business account first',
    );
  }

  if (whatsappMessageChannels.length > 1) {
    const candidates = whatsappMessageChannels
      .map(
        ({ connectedAccountHandle, messageChannelId }) =>
          `${connectedAccountHandle} (${messageChannelId})`,
      )
      .join(', ');

    throw new Error(
      `Multiple WhatsApp message channels found, cannot decide which one to import into: ${candidates}`,
    );
  }

  return whatsappMessageChannels[0].messageChannelId;
};
