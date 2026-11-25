import { defineLogicFunction, RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import { isNonEmptyString } from '@sniptt/guards';
import { WHATSAPP_LOGIC_FUNCTION_INITIAL_WEBHOOK_UNIVERSAL_IDENTIFIER } from "src/constants/universal-identifiers";

const handler = async (params: RoutePayload) => {
  const verifyToken = process.env.VERIFY_TOKEN;
  const query = params.queryStringParameters;
  const challenge = query['hub.challenge'];

  if (
    !isNonEmptyString(verifyToken) ||
    query['hub.mode'] !== 'subscribe' ||
    query['hub.verify_token'] !== verifyToken ||
    !isNonEmptyString(challenge)
  ) {
    return new Response('', { status: 403 });
  }

  return new Response(challenge, { status: 200 });
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LOGIC_FUNCTION_INITIAL_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'initial-webhook-test',
  description: 'Endpoint used to validate webhooks by Meta',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/whatsapp',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
