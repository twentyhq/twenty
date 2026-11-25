import { defineLogicFunction } from 'twenty-sdk/define';
import { createWhatsAppMessageChannels } from 'src/logic-functions/data/create-message-channel.util';
import { getWhatsAppAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { linkWhatsAppBusinessAccountsToConnection } from 'src/logic-functions/data/link-whatsapp-business-accounts-to-connection.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { importWhatsAppTemplates } from 'src/logic-functions/data/import-whatsapp-templates.util';
import { getWhatsAppBusinessAccountIdsOrThrow } from 'src/logic-functions/data/get-whatsapp-business-account-ids-or-throw.util';
import { WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async ({ connectedAccountId }: { connectedAccountId: string }) => {
  const accessToken = await getWhatsAppAccessTokenOrThrow({ connectedAccountId });
  const { whatsAppBusinessAccountIds } = await getWhatsAppBusinessAccountIdsOrThrow({ accessToken });

  await linkWhatsAppBusinessAccountsToConnection({ connectedAccountId, whatsAppBusinessAccountIds });

  await createWhatsAppMessageChannels({
    accessToken,
    connectedAccountId,
    whatsAppBusinessAccountIds,
  });

  for (const whatsAppBusinessAccountId of whatsAppBusinessAccountIds) {
    await whatsAppApiRequest({
      accessToken,
      endpoint: 'POST /{wabaId}/subscribed_apps',
      pathParams: { wabaId: whatsAppBusinessAccountId },
    });
    await importWhatsAppTemplates({ accessToken, whatsAppBusinessAccountId });
  }
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-connect',
  description: 'Subscribes to the webhooks of the WhatsApp Business Accounts the token can manage, creates a message channel per phone number and imports their templates',
  timeoutSeconds: 120,
  handler,
});
