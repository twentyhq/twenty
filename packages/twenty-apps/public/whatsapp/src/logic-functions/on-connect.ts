import { defineLogicFunction } from 'twenty-sdk/define';
import { createWhatsappMessageChannels } from 'src/logic-functions/data/create-message-channel.util';
import { getWhatsappAccessTokenOrThrow } from 'src/logic-functions/data/get-whatsapp-access-token-or-throw.util';
import { getWhatsappBusinessAccountIdsOrThrow } from 'src/logic-functions/data/get-whatsapp-business-account-ids-or-throw.util';
import { WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async ({ connectedAccountId }: { connectedAccountId: string }) => {
  const accessToken = await getWhatsappAccessTokenOrThrow({ connectedAccountId });
  const { whatsappBusinessAccountIds } = await getWhatsappBusinessAccountIdsOrThrow({ accessToken });

  await createWhatsappMessageChannels({
    accessToken,
    connectedAccountId,
    whatsappBusinessAccountIds,
  });
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-connect',
  description: 'Creates a message channel for each phone number of the WhatsApp Business Accounts the token can manage',
  timeoutSeconds: 30,
  handler,
});
