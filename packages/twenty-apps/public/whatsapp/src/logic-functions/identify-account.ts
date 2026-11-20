import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type IdentifyAccountPayload, type IdentifyAccountResult } from 'twenty-sdk/logic-function';
import { getWhatsAppBusinessAccountIdsOrThrow } from 'src/logic-functions/data/get-whatsapp-business-account-ids-or-throw.util';
import { whatsAppApiRequest } from 'src/logic-functions/data/whatsapp-api-request.util';
import { WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async ({ accessToken }: IdentifyAccountPayload): Promise<IdentifyAccountResult> => {
  const trimmedAccessToken = accessToken.trim();
  const { userId, whatsAppBusinessAccountIds } = await getWhatsAppBusinessAccountIdsOrThrow({
    accessToken: trimmedAccessToken,
  });

  const whatsAppBusinessAccounts = await Promise.all(
    whatsAppBusinessAccountIds.map((whatsAppBusinessAccountId) =>
      whatsAppApiRequest({
        accessToken: trimmedAccessToken,
        endpoint: 'GET /{wabaId}',
        pathParams: { wabaId: whatsAppBusinessAccountId },
        query: { fields: 'name' },
      }),
    ),
  );

  return {
    externalAccountId: userId ?? whatsAppBusinessAccountIds.join(','),
    handle: whatsAppBusinessAccounts.map(({ id, name }) => (isNonEmptyString(name) ? name : id)).join(', '),
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  name: 'identify-account',
  description: 'Checks that the access token can manage at least one WhatsApp Business Account',
  timeoutSeconds: 10,
  handler,
});
