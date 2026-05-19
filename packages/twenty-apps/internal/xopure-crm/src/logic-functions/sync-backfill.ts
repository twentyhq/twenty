import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { handleSyncBackfill } from './handlers/sync-backfill-handler';

const handler = async (event: RoutePayload) =>
  handleSyncBackfill({
    event,
    expectedSecret: process.env.XOPURE_SYNC_WEBHOOK_SECRET,
    client: new CoreApiClient(),
  });

export default defineLogicFunction({
  universalIdentifier: 'b7c4d3e2-9f6a-4c8b-b5d7-2e1f3a4c5d6e',
  name: 'xopure-sync-backfill',
  description: 'Batch backfill endpoint for pushing Supabase records into Twenty CRM.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: '/xopure/sync/backfill',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-xopure-sync-secret', 'content-type'],
  },
});
