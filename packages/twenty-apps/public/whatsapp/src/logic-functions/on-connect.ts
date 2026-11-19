import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';
import { createWhatsappMessageChannels } from 'src/logic-functions/data/create-message-channel.util';
import { WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async ({ connectedAccountId }: { connectedAccountId: string }) => {
  const { externalAccountId } = await getConnection(connectedAccountId);

  if (!isNonEmptyString(externalAccountId)) {
    throw new Error(`WhatsApp connection ${connectedAccountId} has no WhatsApp Business Account id`);
  }

  await createWhatsappMessageChannels({
    connectedAccountId,
    whatsappBusinessAccountId: externalAccountId,
  });
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-connect',
  description: 'Creates a message channel for each phone number of the connected WhatsApp Business Account',
  timeoutSeconds: 30,
  handler,
});
