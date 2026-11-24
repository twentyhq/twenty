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
}): Promise<
  | { outcome: 'MESSAGE_NOT_FOUND' }
  | { outcome: 'UNCHANGED' }
  | { outcome: 'UPDATED'; text: string | null; statusError: string | null; campaignId: string | null }
> => {
  const messageChannel = await findMessageChannelByDisplayPhoneNumber(displayPhoneNumber);

  if (!isDefined(messageChannel)) {
    return { outcome: 'UNCHANGED' };
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
      edges: { node: { message: { id: true, text: true, whatsAppStatus: true, whatsAppCampaignId: true } } },
    },
  });
  const message:
    | { id: string; text: string | null; whatsAppStatus: string | null; whatsAppCampaignId: string | null }
    | undefined =
    messageChannelMessageAssociations?.edges[0]?.node.message ?? undefined;

  if (!isDefined(message)) {
    return { outcome: 'MESSAGE_NOT_FOUND' };
  }

  const nextStatus = getNextWhatsAppMessageStatus({
    currentStatus: message.whatsAppStatus,
    reportedStatus,
  });

  if (!isDefined(nextStatus)) {
    return { outcome: 'UNCHANGED' };
  }

  const statusError =
    reportedStatus === 'failed'
      ? errors.map(({ code, title, error_data }) => `${code}: ${error_data?.details ?? title}`).join('; ')
      : null;

  await client.mutation({
    updateMessage: {
      __args: {
        id: message.id,
        data: {
          whatsAppStatus: nextStatus,
          whatsAppStatusError: statusError,
        },
      },
      id: true,
    },
  });

  return { outcome: 'UPDATED', text: message.text, statusError, campaignId: message.whatsAppCampaignId };
};
