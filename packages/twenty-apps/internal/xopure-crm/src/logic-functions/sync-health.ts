import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { handleSyncHealth } from './handlers/sync-health-handler';

const handler = async (event: RoutePayload) =>
  handleSyncHealth({
    client: new CoreApiClient(),
  });

export default defineLogicFunction({
  universalIdentifier: 'd4e9b3f2-8c5a-4d1e-a7b6-5f4c3d2e1b0a',
  name: 'xopure-sync-health',
  description:
    'Health check endpoint for the Supabase-to-Twenty sync pipeline.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/xopure/sync/health',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
