import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { selectWhatsAppThreadExternalId } from 'src/logic-functions/data/select-whatsapp-thread-external-id.util';
import { type WhatsAppIdentity } from 'src/logic-functions/types/whatsapp-identity.type';

export const resolveWhatsAppThreadExternalId = async ({
  messageChannelId,
  groupId,
  customerIdentity,
}: {
  messageChannelId: string;
  groupId?: string;
  customerIdentity: WhatsAppIdentity;
}): Promise<string | undefined> => {
  const isKnownByBothIdentifiers =
    !isNonEmptyString(groupId) &&
    isNonEmptyString(customerIdentity.whatsAppId) &&
    isNonEmptyString(customerIdentity.whatsAppUserId);

  if (!isKnownByBothIdentifiers) {
    return selectWhatsAppThreadExternalId({ groupId, customerIdentity, existingThreadExternalIds: [] });
  }

  const { messageChannelMessageAssociations } = await new CoreApiClient().query({
    messageChannelMessageAssociations: {
      __args: {
        filter: {
          messageChannelId: { eq: messageChannelId },
          messageThreadExternalId: { in: [customerIdentity.whatsAppId, customerIdentity.whatsAppUserId] },
        },
        first: 1,
      },
      edges: { node: { messageThreadExternalId: true } },
    },
  });

  return selectWhatsAppThreadExternalId({
    customerIdentity,
    existingThreadExternalIds: (messageChannelMessageAssociations?.edges ?? [])
      .map(({ node }: { node: { messageThreadExternalId: string | null } }) => node.messageThreadExternalId)
      .filter(isNonEmptyString),
  });
};
