import { defineLogicFunction } from 'twenty-sdk/define';
import { unlinkConnectionFromWhatsappBusinessAccounts } from 'src/logic-functions/data/unlink-connection-from-whatsapp-business-accounts.util';
import { WHATSAPP_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async ({ connectedAccountId }: { connectedAccountId: string }) => {
  await unlinkConnectionFromWhatsappBusinessAccounts(connectedAccountId);
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-disconnect',
  description: 'Forgets which WhatsApp Business Accounts belonged to the disconnected account',
  timeoutSeconds: 10,
  handler,
});
