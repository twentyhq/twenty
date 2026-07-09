import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const sendWhatsappReply = async ({
  connectedAccountId,
  recipientHandle,
  body,
  metadataClient = new MetadataApiClient(),
}: {
  connectedAccountId: string;
  recipientHandle: string;
  body: string;
  metadataClient?: MetadataApiClient;
}): Promise<void> => {
  const { sendEmail } = await metadataClient.mutation({
    sendEmail: {
      __args: {
        input: {
          connectedAccountId,
          to: recipientHandle,
          subject: '',
          body,
        },
      },
      success: true,
      error: true,
    },
  });

  if (!sendEmail.success) {
    throw new Error(
      isNonEmptyString(sendEmail.error)
        ? sendEmail.error
        : 'Failed to send WhatsApp message',
    );
  }
};
