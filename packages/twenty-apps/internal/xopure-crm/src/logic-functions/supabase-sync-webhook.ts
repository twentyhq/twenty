import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { handleSupabaseSyncWebhook } from './handlers/supabase-sync-webhook-handler';

const handler = async (event: RoutePayload) =>
  handleSupabaseSyncWebhook({
    event,
    expectedSecret: process.env.XOPURE_SYNC_WEBHOOK_SECRET,
    client: new CoreApiClient(),
  });

export default defineLogicFunction({
  universalIdentifier: 'e9a5513e-0e57-4f38-9f10-517bc6440158',
  name: 'xopure-supabase-sync-webhook',
  description: 'Authenticated webhook intake for Supabase-to-Twenty CRM sync.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/xopure/sync/supabase',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-xopure-sync-secret', 'content-type'],
  },
});
