import { defineLogicFunction } from 'twenty-sdk-deep/define-logic-function';
import type { RoutePayload } from 'twenty-sdk/define';

type Payload = { name?: string };

const handler = async (event: RoutePayload<Payload>) => {
  return { hello: event.body?.name ?? 'world' };
};

export default defineLogicFunction({
  universalIdentifier: '44444444-4444-4444-8444-444444444444',
  name: 'deep-import',
  description: 'Imports defineLogicFunction from the deep per-module path',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/bundle-investigation/deep-import',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
