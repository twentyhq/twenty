import { defineLogicFunction } from 'twenty-sdk/define';

import { WHATSAPP_ENVIRONMENT_VARIABLE_NAMES } from 'src/constants/environment-variable-names';
import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { type SendWhatsappMessagePayload } from 'src/logic-functions/types/send-whatsapp-message-payload.type';
import { getEnvironmentVariableOrThrow } from 'src/logic-functions/utils/get-environment-variable-or-throw.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { normalizeWhatsappRecipientOrThrow } from 'src/logic-functions/utils/normalize-whatsapp-recipient-or-throw.util';
import { sendWhatsappTextMessage } from 'src/logic-functions/utils/send-whatsapp-text-message.util';

const handler = async (event: SendWhatsappMessagePayload) => {
  const { input, connectedAccount } = event;

  if (!isNonEmptyString(connectedAccount.accessToken)) {
    throw new Error(
      `WhatsApp connected account ${connectedAccount.handle} has no access token. Reconnect the WhatsApp account.`,
    );
  }

  const phoneNumberId = getEnvironmentVariableOrThrow(
    WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.phoneNumberId,
  );

  return sendWhatsappTextMessage({
    phoneNumberId,
    accessToken: connectedAccount.accessToken,
    to: normalizeWhatsappRecipientOrThrow(input.to),
    body: input.body,
  });
};

export default defineLogicFunction({
  universalIdentifier:
    WHATSAPP_UNIVERSAL_IDENTIFIERS.sendWhatsappMessageFunction,
  name: 'send-whatsapp-message',
  description:
    'Sends an outbound WhatsApp text message through the WhatsApp Business Cloud API when a message is sent on the WhatsApp channel.',
  timeoutSeconds: 30,
  handler,
});
