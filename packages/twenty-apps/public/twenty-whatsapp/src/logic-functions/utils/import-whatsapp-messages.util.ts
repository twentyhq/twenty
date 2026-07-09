import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { type ImportMessage } from 'src/logic-functions/types/import-message.type';

export const importWhatsappMessages = async ({
  messageChannelId,
  messages,
  metadataClient = new MetadataApiClient(),
}: {
  messageChannelId: string;
  messages: ImportMessage[];
  metadataClient?: MetadataApiClient;
}): Promise<number> => {
  const { importMessages } = await metadataClient.mutation({
    importMessages: {
      __args: { input: { messageChannelId, messages } },
      success: true,
      error: true,
      importedMessages: {
        externalId: true,
      },
    },
  });

  if (importMessages.success !== true) {
    throw new Error(
      `importMessages failed: ${importMessages.error ?? 'unknown error'}`,
    );
  }

  return importMessages.importedMessages?.length ?? 0;
};
