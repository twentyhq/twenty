import { CoreApiClient } from 'twenty-sdk/generated';
import { defineLogicFunction } from '@/sdk';

export const CHECK_CORE_CLIENT_UNIVERSAL_IDENTIFIER =
  'b7c8d9e0-1a2b-4c3d-8e5f-6a7b8c9d0e1f';

const checkCoreClientHandler = () => {
  const client = new CoreApiClient();

  return {
    hasQuery: typeof client.query === 'function',
    hasMutation: typeof client.mutation === 'function',
  };
};

export default defineLogicFunction({
  universalIdentifier: CHECK_CORE_CLIENT_UNIVERSAL_IDENTIFIER,
  name: 'check-core-client',
  timeoutSeconds: 5,
  handler: checkCoreClientHandler,
  httpRouteTriggerSettings: {
    path: '/check-core-client',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
