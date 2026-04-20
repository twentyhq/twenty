import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SYNC_RESEND_DATA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';
import { getResendClient } from 'src/modules/resend/shared/utils/get-resend-client';
import { logStepOutcome } from 'src/modules/resend/sync/utils/log-step-outcome';
import { orchestrateSyncResend } from 'src/modules/resend/sync/utils/orchestrate-sync-resend';
import { reportAndThrowIfErrors } from 'src/modules/resend/sync/utils/report-and-throw-if-errors';
import { syncBroadcasts } from 'src/modules/resend/sync/utils/sync-broadcasts';
import { syncContacts } from 'src/modules/resend/sync/utils/sync-contacts';
import { syncEmails } from 'src/modules/resend/sync/utils/sync-emails';
import { syncSegments } from 'src/modules/resend/sync/utils/sync-segments';
import { syncTemplates } from 'src/modules/resend/sync/utils/sync-templates';

const handler = async (): Promise<void> => {
  const resend = getResendClient();
  const client = new CoreApiClient();
  const syncedAt = new Date().toISOString();

  const outcomes = await orchestrateSyncResend({
    syncSegments: () => syncSegments(resend, client, syncedAt),
    syncTemplates: () => syncTemplates(resend, client),
    syncContacts: () => syncContacts(resend, client, syncedAt),
    syncEmails: () => syncEmails(resend, client, syncedAt),
    syncBroadcasts: (segmentMap) => syncBroadcasts(resend, client, segmentMap),
  });

  for (const outcome of outcomes) {
    logStepOutcome(outcome);
  }

  reportAndThrowIfErrors(outcomes);
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
