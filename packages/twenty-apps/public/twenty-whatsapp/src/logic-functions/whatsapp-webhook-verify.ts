import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { WHATSAPP_ENVIRONMENT_VARIABLE_NAMES } from 'src/constants/environment-variable-names';
import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { getEnvironmentVariableOrThrow } from 'src/logic-functions/utils/get-environment-variable-or-throw.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const handler = async (event: RoutePayload) => {
  const mode = event.queryStringParameters['hub.mode'];
  const verifyToken = event.queryStringParameters['hub.verify_token'];
  const challenge = event.queryStringParameters['hub.challenge'];
  const expectedVerifyToken = getEnvironmentVariableOrThrow(
    WHATSAPP_ENVIRONMENT_VARIABLE_NAMES.webhookVerifyToken,
  );

  if (
    mode !== 'subscribe' ||
    verifyToken !== expectedVerifyToken ||
    !isNonEmptyString(challenge)
  ) {
    return {
      __twentyHttpResponse: true,
      status: 403,
      body: 'Forbidden',
    };
  }

  return challenge;
};

export default defineLogicFunction({
  universalIdentifier:
    WHATSAPP_UNIVERSAL_IDENTIFIERS.whatsappWebhookVerifyFunction,
  name: 'whatsapp-webhook-verify',
  description:
    'Answers the Meta webhook verification handshake by echoing the challenge when the verify token matches.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/whatsapp/webhook',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
