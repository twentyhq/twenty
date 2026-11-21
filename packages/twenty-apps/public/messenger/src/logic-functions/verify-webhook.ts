import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { MESSENGER_LOGIC_FUNCTION_VERIFY_WEBHOOK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async ({ queryStringParameters }: RoutePayload) => {
  const verifyToken = process.env.VERIFY_TOKEN;
  const challenge = queryStringParameters['hub.challenge'];

  if (
    !isNonEmptyString(verifyToken) ||
    queryStringParameters['hub.mode'] !== 'subscribe' ||
    queryStringParameters['hub.verify_token'] !== verifyToken ||
    !isNonEmptyString(challenge)
  ) {
    return new Response('', { status: 403 });
  }

  return new Response(challenge, { status: 200 });
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_VERIFY_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'verify-webhook',
  description: 'Answers the verification request Meta sends when the webhook is set up',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/messenger',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
