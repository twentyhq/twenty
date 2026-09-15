import { CoreApiClient } from 'twenty-client-sdk/core';
import { createHash } from 'node:crypto';
import {
  enqueueJobs,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { defineLogicFunction } from 'twenty-sdk/define';
import { recoverDesktopRecordings } from 'src/logic-functions/flows/recover-desktop-recordings.util';
import { recoverRecordingSummaries } from 'src/logic-functions/flows/recover-recording-summaries.util';

const RECONCILE_DESKTOP_RECORDINGS_IDENTIFIER =
  '2b1f250a-1409-4f7e-8e9b-66ad67e6b38c';

export const reconcileDesktopRecordingsHandler = async (
  payload: { recover?: boolean },
  { workspaceId }: LogicFunctionExecutionContext,
) => {
  if (!payload?.recover) {
    return enqueueJobs({
      logicFunctionUniversalIdentifier: RECONCILE_DESKTOP_RECORDINGS_IDENTIFIER,
      jobs: [
        {
          jobId: `companion-recovery-${Math.floor(Date.now() / 300_000)}`,
          payload: { recover: true },
        },
      ],
      delayMs:
        createHash('sha256').update(workspaceId).digest().readUInt32BE(0) %
        300_000,
    });
  }
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
  universalIdentifier: RECONCILE_DESKTOP_RECORDINGS_IDENTIFIER,
  name: 'reconcile-desktop-recordings',
  description:
    'Recovers desktop uploads and artifact imports after missed Recall webhooks.',
  timeoutSeconds: 250,
  handler: reconcileDesktopRecordingsHandler,
  cronTriggerSettings: { pattern: '*/5 * * * *' },
});
