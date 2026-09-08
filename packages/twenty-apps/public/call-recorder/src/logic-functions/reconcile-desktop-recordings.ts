import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { recoverDesktopRecordings } from 'src/logic-functions/flows/recover-desktop-recordings.util';

export const reconcileDesktopRecordingsHandler = async () =>
  recoverDesktopRecordings(new CoreApiClient(), new Date());

export default defineLogicFunction({
  universalIdentifier: 'f5aca5c3-7bff-4a70-a879-be5682c3fdd2',
  name: 'reconcile-desktop-recordings',
  description:
    'Recovers desktop uploads and artifact imports after missed Recall webhooks.',
  timeoutSeconds: 250,
  handler: reconcileDesktopRecordingsHandler,
  cronTriggerSettings: { pattern: '*/5 * * * *' },
});
