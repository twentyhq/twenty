import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  RESEND_SYNC_CRON_PATTERNS,
  RESEND_SYNC_SLOT_DEADLINE_SLACK_MS,
  RESEND_SYNC_SLOT_TIMEOUT_SECONDS,
} from '@modules/resend/constants/sync-config';
import { RESEND_SYNC_TEMPLATES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import { getResendClient } from '@modules/resend/shared/utils/get-resend-client';
import { logStepOutcome } from '@modules/resend/sync/utils/log-step-outcome';
import { runSyncStep } from '@modules/resend/sync/utils/run-sync-step';
import {
  summariseOutcomes,
  type SyncSummaryStep,
} from '@modules/resend/sync/utils/summarise-outcomes';
import { syncTemplates } from '@modules/resend/sync/utils/sync-templates';

type ResendSyncTemplatesSummary = {
  totalDurationMs: number;
  steps: SyncSummaryStep[];
};

export const resendSyncTemplatesHandler =
  async (): Promise<ResendSyncTemplatesSummary> => {
    const resendClient = getResendClient();
    const coreApiClient = new CoreApiClient();

    const deadlineAtMs =
      Date.now() +
      RESEND_SYNC_SLOT_TIMEOUT_SECONDS.TEMPLATES * 1_000 -
      RESEND_SYNC_SLOT_DEADLINE_SLACK_MS;

    const templates = await runSyncStep('TEMPLATES', () =>
      syncTemplates(resendClient, coreApiClient, { deadlineAtMs }),
    );

    logStepOutcome(templates);

    const { totalDurationMs, steps } = summariseOutcomes([templates]);

    return { totalDurationMs, steps };
  };

export default defineLogicFunction({
  universalIdentifier: RESEND_SYNC_TEMPLATES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'resend-sync-templates',
  description:
    'Syncs Resend templates. Resumes from its own cursor if the function timeouts mid-pagination.',
  timeoutSeconds: RESEND_SYNC_SLOT_TIMEOUT_SECONDS.TEMPLATES,
  handler: resendSyncTemplatesHandler,
  cronTriggerSettings: {
    pattern: RESEND_SYNC_CRON_PATTERNS.TEMPLATES,
  },
});
