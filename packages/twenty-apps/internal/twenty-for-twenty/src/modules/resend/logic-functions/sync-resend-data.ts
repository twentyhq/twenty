import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk';

import { SYNC_RESEND_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';
import { getResendClient } from 'src/modules/resend/utils/get-resend-client';
import type { SyncResult } from 'src/modules/resend/types/sync-result';
import { syncBroadcasts } from 'src/modules/resend/utils/sync-broadcasts';
import { syncContacts } from 'src/modules/resend/utils/sync-contacts';
import { syncEmails } from 'src/modules/resend/utils/sync-emails';
import { syncSegments } from 'src/modules/resend/utils/sync-segments';
import { syncTemplates } from 'src/modules/resend/utils/sync-templates';

const logStepResult = (name: string, result: SyncResult): void => {
  console.log(
    `[sync] ${name}: ${result.fetched} fetched, ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`,
  );

  for (const error of result.errors) {
    console.error(`[sync] ${name} error: ${error}`);
  }
};

const runStep = async (
  name: string,
  fn: () => Promise<SyncResult>,
  allErrors: string[],
): Promise<boolean> => {
  try {
    const result = await fn();

    logStepResult(name, result);
    allErrors.push(...result.errors);

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    allErrors.push(`${name}: ${message}`);
    console.error(`[sync] ${name} failed: ${message}`);

    return false;
  }
};

const handler = async () => {
  const resend = getResendClient();
  const client = new CoreApiClient();

  const allErrors: string[] = [];

  let segmentMap = new Map<string, string>();
  let templateHtmlMap = new Map<string, string>();

  const segmentsOk = await runStep(
    'segments',
    async () => {
      const output = await syncSegments(resend, client);

      segmentMap = output.existingMap;

      return output.result;
    },
    allErrors,
  );

  await runStep('contacts', () => syncContacts(resend, client), allErrors);

  const templatesOk = await runStep(
    'templates',
    async () => {
      const output = await syncTemplates(resend, client);

      templateHtmlMap = output.templateHtmlMap;

      return output.result;
    },
    allErrors,
  );

  if (segmentsOk && templatesOk) {
    await runStep(
      'broadcasts',
      () => syncBroadcasts(resend, client, segmentMap, templateHtmlMap),
      allErrors,
    );
  } else {
    const skippedDeps = [
      !segmentsOk && 'segments',
      !templatesOk && 'templates',
    ].filter(Boolean);

    allErrors.push(
      `broadcasts: skipped because ${skippedDeps.join(' and ')} failed`,
    );
    console.warn(
      `[sync] broadcasts skipped: prerequisite steps (${skippedDeps.join(', ')}) failed`,
    );
  }

  await runStep('emails', () => syncEmails(resend, client), allErrors);

  if (allErrors.length > 0) {
    throw new Error(
      `Sync completed with ${allErrors.length} error(s):\n${allErrors.join('\n')}`,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier: SYNC_RESEND_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-resend-data',
  description:
    'Syncs emails, contacts, templates, broadcasts, and segments from Resend every 5 minutes',
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
});
