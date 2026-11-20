import { defineLogicFunction } from 'twenty-sdk/define';
import { createWhatsappMessageChannels } from 'src/logic-functions/data/create-message-channel.util';
import { getWhatsappAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { linkWhatsappBusinessAccountsToConnection } from 'src/logic-functions/data/link-whatsapp-business-accounts-to-connection.util';
import { importWhatsappTemplates } from 'src/logic-functions/data/import-whatsapp-templates.util';
import { getWhatsappBusinessAccountIdsOrThrow } from 'src/logic-functions/data/get-whatsapp-business-account-ids-or-throw.util';
import { WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async ({ connectedAccountId }: { connectedAccountId: string }) => {
  const accessToken = await getWhatsappAccessTokenOrThrow({ connectedAccountId });
  const { whatsappBusinessAccountIds } = await getWhatsappBusinessAccountIdsOrThrow({ accessToken });

  await linkWhatsappBusinessAccountsToConnection({ connectedAccountId, whatsappBusinessAccountIds });

  await createWhatsappMessageChannels({
    accessToken,
    connectedAccountId,
    whatsappBusinessAccountIds,
  });

  for (const whatsappBusinessAccountId of whatsappBusinessAccountIds) {
    await importWhatsappTemplates({ accessToken, whatsappBusinessAccountId });
  }
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-connect',
  description: 'Creates a message channel for each phone number and imports the templates of the WhatsApp Business Accounts the token can manage',
  timeoutSeconds: 120,
  handler,
});
