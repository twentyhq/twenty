import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';
import { WHATSAPP_MESSAGE_STATUSES } from 'src/constants/whatsapp-message-statuses.constant';
import { findMessageChannelByDisplayPhoneNumber } from 'src/logic-functions/data/find-message-channel-by-display-phone-number.util';
import { getNextWhatsAppMessageStatus } from 'src/logic-functions/data/get-next-whatsapp-message-status.util';

export const updateWhatsAppMessageStatus = async ({
  displayPhoneNumber,
  messageExternalId,
  reportedStatus,
  errors = [],
}: {
  displayPhoneNumber: string;
  messageExternalId: string;
  reportedStatus: (typeof WHATSAPP_MESSAGE_STATUSES)[number];
  errors?: Array<{ code: number; title: string; error_data?: { details?: string } }>;
}) => {
  const messageChannel = await findMessageChannelByDisplayPhoneNumber(displayPhoneNumber);

  if (!isDefined(messageChannel)) {
    return;
  }

  const client = new CoreApiClient();
  const { messageChannelMessageAssociations } = await client.query({
    messageChannelMessageAssociations: {
      __args: {
        filter: {
          messageChannelId: { eq: messageChannel.id },
          messageExternalId: { eq: messageExternalId },
        },
        first: 1,
      },
      edges: { node: { message: { id: true, whatsAppStatus: true } } },
    },
  });
  const message: { id: string; whatsAppStatus: string | null } | undefined =
    messageChannelMessageAssociations?.edges[0]?.node.message ?? undefined;

  // statuses also arrive for messages Twenty never stored, such as the extra parts of a reply
  if (!isDefined(message)) {
    return;
  }

  const nextStatus = getNextWhatsAppMessageStatus({
    currentStatus: message.whatsAppStatus,
    reportedStatus,
  });

  if (!isDefined(nextStatus)) {
    return;
  }

  await client.mutation({
    updateMessage: {
      __args: {
        id: message.id,
        data: {
          whatsAppStatus: nextStatus,
          whatsAppStatusError:
            reportedStatus === 'failed'
              ? errors.map(({ code, title, error_data }) => `${code}: ${error_data?.details ?? title}`).join('; ')
              : null,
        },
      },
      id: true,
    },
  });
};
