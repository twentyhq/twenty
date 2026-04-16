import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk';

import { getResendClient } from 'src/utils/get-resend-client';
import type { SyncResult } from 'src/types/sync-result';
import { syncBroadcasts } from 'src/utils/sync-broadcasts';
import { syncContacts } from 'src/utils/sync-contacts';
import { syncEmails } from 'src/utils/sync-emails';
import { syncSegments } from 'src/utils/sync-segments';
import { syncTemplates } from 'src/utils/sync-templates';

const logStepResult = (name: string, result: SyncResult): void => {
  console.log(
    `[sync] ${name}: ${result.fetched} fetched, ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`,
  );

  for (const error of result.errors) {
    console.error(`[sync] ${name} error: ${error}`);
  }
};

const handler = async () => {
  const resend = getResendClient();
  const client = new CoreApiClient();

  const allErrors: string[] = [];

  const [segmentsOutput, contactsResult, templatesResult] =
    await Promise.allSettled([
      syncSegments(resend, client),
      syncContacts(resend, client),
      syncTemplates(resend, client),
    ]);

  let segmentMap = new Map<string, string>();

  if (segmentsOutput.status === 'fulfilled') {
    logStepResult('segments', segmentsOutput.value.result);
    allErrors.push(...segmentsOutput.value.result.errors);
    segmentMap = segmentsOutput.value.existingMap;
  } else {
    const message =
      segmentsOutput.reason instanceof Error
        ? segmentsOutput.reason.message
        : String(segmentsOutput.reason);

    allErrors.push(`segments: ${message}`);
    console.error(`[sync] segments failed: ${message}`);
  }

  if (contactsResult.status === 'fulfilled') {
    logStepResult('contacts', contactsResult.value);
    allErrors.push(...contactsResult.value.errors);
  } else {
    const message =
      contactsResult.reason instanceof Error
        ? contactsResult.reason.message
        : String(contactsResult.reason);

    allErrors.push(`contacts: ${message}`);
    console.error(`[sync] contacts failed: ${message}`);
  }

  if (templatesResult.status === 'fulfilled') {
    logStepResult('templates', templatesResult.value);
    allErrors.push(...templatesResult.value.errors);
  } else {
    const message =
      templatesResult.reason instanceof Error
        ? templatesResult.reason.message
        : String(templatesResult.reason);

    allErrors.push(`templates: ${message}`);
    console.error(`[sync] templates failed: ${message}`);
  }

  const dependentSteps: Array<{
    name: string;
    fn: () => Promise<SyncResult>;
  }> = [
    {
      name: 'broadcasts',
      fn: () => syncBroadcasts(resend, client, segmentMap),
    },
    { name: 'emails', fn: () => syncEmails(resend, client) },
  ];

  for (const step of dependentSteps) {
    try {
      const result = await step.fn();

      logStepResult(step.name, result);
      allErrors.push(...result.errors);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      allErrors.push(`${step.name}: ${message}`);
      console.error(`[sync] ${step.name} failed: ${message}`);
    }
  }

  if (allErrors.length > 0) {
    throw new Error(
      `Sync completed with ${allErrors.length} error(s):\n${allErrors.join('\n')}`,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier: '7a3c841f-509e-46f0-b2f1-fb942b716ee3',
  name: 'sync-resend-data',
  description:
    'Syncs emails, contacts, templates, broadcasts, and segments from Resend every 5 minutes',
  timeoutSeconds: 300,
  handler,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
});
