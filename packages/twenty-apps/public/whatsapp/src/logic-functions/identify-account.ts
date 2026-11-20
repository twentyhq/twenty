import { defineLogicFunction } from 'twenty-sdk/define';
import { type IdentifyAccountPayload, type IdentifyAccountResult } from 'twenty-sdk/logic-function';
import { getWhatsappBusinessAccountIdsOrThrow } from 'src/logic-functions/data/get-whatsapp-business-account-ids-or-throw.util';
import { WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async ({ accessToken }: IdentifyAccountPayload): Promise<IdentifyAccountResult> => {
  const { userId, whatsappBusinessAccountIds } = await getWhatsappBusinessAccountIdsOrThrow({
    accessToken: accessToken.trim(),
  });

  return { externalAccountId: userId ?? whatsappBusinessAccountIds.join(',') };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  name: 'identify-account',
  description: 'Checks that the access token can manage at least one WhatsApp Business Account',
  timeoutSeconds: 10,
  handler,
});
