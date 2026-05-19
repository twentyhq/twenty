import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { handleSyncReconciliation } from './handlers/sync-reconciliation-handler';

const handler = async () =>
  handleSyncReconciliation({
    client: new CoreApiClient(),
  });

export default defineLogicFunction({
  universalIdentifier: 'a3f8c2d1-7b4e-4a9f-b5c8-3d2e1f0a9b8c',
  name: 'xopure-sync-reconciliation',
  description:
    'Periodic reconciliation scan for stale and failed Supabase-to-Twenty sync records.',
  timeoutSeconds: 30,
  handler,
  cronTriggerSettings: {
    pattern: '*/15 * * * *',
  },
});
