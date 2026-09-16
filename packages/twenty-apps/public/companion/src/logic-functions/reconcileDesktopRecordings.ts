import { defineLogicFunction } from 'twenty-sdk/define';
import { reconcileDesktopRecordingsHandler } from 'src/logic-functions/utils/reconcileDesktopRecordingsHandler';

const RECONCILE_DESKTOP_RECORDINGS_IDENTIFIER =
  '2b1f250a-1409-4f7e-8e9b-66ad67e6b38c';

export default defineLogicFunction({
  universalIdentifier: RECONCILE_DESKTOP_RECORDINGS_IDENTIFIER,
  name: 'reconcile-desktop-recordings',
  description:
    'Recovers desktop uploads and artifact imports after missed Recall webhooks.',
  timeoutSeconds: 250,
  handler: reconcileDesktopRecordingsHandler,
  cronTriggerSettings: { pattern: '*/5 * * * *' },
});
