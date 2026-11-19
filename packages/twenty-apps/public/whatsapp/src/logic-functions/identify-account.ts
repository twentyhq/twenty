import { defineLogicFunction } from 'twenty-sdk/define';
import { type IdentifyAccountPayload, type IdentifyAccountResult } from 'twenty-sdk/logic-function';
import { getWhatsappBusinessAccountPhoneNumbers } from 'src/logic-functions/data/get-whatsapp-business-account-phone-numbers.util';
import { WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// The api-key connection stores the WhatsApp Business Account id; calls to Meta use the ACCESS_TOKEN variable.
const handler = async ({ accessToken }: IdentifyAccountPayload): Promise<IdentifyAccountResult> => {
  const whatsappBusinessAccountId = accessToken.trim();

  await getWhatsappBusinessAccountPhoneNumbers(whatsappBusinessAccountId);

  return { externalAccountId: whatsappBusinessAccountId };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  name: 'identify-account',
  description: 'Checks that the WhatsApp Business Account id is reachable and uses it as the connection identity',
  timeoutSeconds: 10,
  handler,
});
