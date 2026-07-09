import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { WHATSAPP_ENVIRONMENT_VARIABLE_NAMES } from 'src/constants/environment-variable-names';
import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { type WhatsappWebhookBody } from 'src/logic-functions/types/whatsapp-webhook-body.type';
import { getRequiredEnvironmentVariable } from 'src/logic-functions/utils/get-required-environment-variable.util';
import { importWhatsappMessages } from 'src/logic-functions/utils/import-whatsapp-messages.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { parseWhatsappWebhookImportMessages } from 'src/logic-functions/utils/parse-whatsapp-webhook-import-messages.util';
import { resolveWhatsappMessageChannelId } from 'src/logic-functions/utils/resolve-whatsapp-message-channel-id.util';
import { verifyMetaSignature } from 'src/logic-functions/utils/verify-meta-signature.util';

const handler = async (event: RoutePayload<WhatsappWebhookBody>) => {
  const appSecret = getRequiredEnvironmentVariable(
    WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.metaAppSecret,
  );
  const signatureHeader =
    event.headers['x-hub-signature-256'] ??
    event.headers['X-Hub-Signature-256'];

  if (
    !isNonEmptyString(event.rawBody) ||
    !verifyMetaSignature({
      rawBody: event.rawBody,
      signatureHeader,
      appSecret,
    })
  ) {
    return {
      __twentyHttpResponse: true,
      status: 401,
      body: 'Invalid signature',
    };
  }

  const messages = parseWhatsappWebhookImportMessages(event.body);

  if (messages.length === 0) {
    return { success: true, importedCount: 0 };
  }

  const messageChannelId = await resolveWhatsappMessageChannelId();

  const importedCount = await importWhatsappMessages({
    messageChannelId,
    messages,
  });

  return { success: true, importedCount };
};

export default defineLogicFunction({
  universalIdentifier:
    WHATSAPP_UNIVERSAL_IDENTIFIERS.whatsappWebhookReceiveFunction,
  name: 'whatsapp-webhook-receive',
  description:
    'Verifies and ingests incoming WhatsApp webhook deliveries, importing text messages into the WhatsApp message channel.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/whatsapp/webhook',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-hub-signature-256'],
  },
});
