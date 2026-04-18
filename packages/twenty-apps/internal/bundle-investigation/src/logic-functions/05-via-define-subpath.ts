import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';

type Payload = { name?: string };

const handler = async (event: RoutePayload<Payload>) => {
  return { hello: event.body?.name ?? 'world' };
};

export default defineLogicFunction({
  universalIdentifier: '55555555-5555-4555-8555-555555555555',
  name: 'via-define-subpath',
  description: 'Imports from the public twenty-sdk/define subpath',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/bundle-investigation/via-define-subpath',
    httpMethod: 'POST',
    isAuthRequired: false,
  },
});
