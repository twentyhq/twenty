import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

type Payload = { name?: string };

const handler = async (event: RoutePayload<Payload>) => {
  return { hello: event.body?.name ?? 'world' };
};

export default defineLogicFunction({
  universalIdentifier: '11111111-1111-4111-8111-111111111111',
  name: 'bare',
  description: 'Bare-minimum logic function: only defineLogicFunction',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/bundle-investigation/bare',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
