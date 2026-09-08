import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { recoverDesktopRecordings } from 'src/logic-functions/flows/recover-desktop-recordings.util';
import { recoverRecordingSummaries } from 'src/logic-functions/flows/recover-recording-summaries.util';

export const reconcileDesktopRecordingsHandler = async () => {
  const client = new CoreApiClient();
  const now = new Date();
  const [media, summaries] = await Promise.allSettled([
    recoverDesktopRecordings(client, now),
    recoverRecordingSummaries(client, now),
  ]);
  if (media.status === 'rejected') throw media.reason;
  if (summaries.status === 'rejected') throw summaries.reason;
  return media.value;
};

export default defineLogicFunction({
  universalIdentifier: '2b1f250a-1409-4f7e-8e9b-66ad67e6b38c',
  name: 'reconcile-desktop-recordings',
  description:
    'Recovers desktop uploads and artifact imports after missed Recall webhooks.',
  timeoutSeconds: 250,
  handler: reconcileDesktopRecordingsHandler,
  cronTriggerSettings: { pattern: '*/5 * * * *' },
});
