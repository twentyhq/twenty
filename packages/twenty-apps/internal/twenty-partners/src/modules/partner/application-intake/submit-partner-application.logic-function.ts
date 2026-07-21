import { defineLogicFunction } from 'twenty-sdk/define';

import { readSecretGuardedEvent } from 'src/modules/shared/http/read-secret-guarded-event';
import { submitPartnerApplicationSchema } from 'src/modules/partner/application-intake/services/submit-partner-application-input.schema';
import {
  submitPartnerApplication,
  type SubmitPartnerApplicationResult,
} from 'src/modules/partner/application-intake/services/submit-partner-application.service';

export type { SubmitPartnerApplicationInput } from 'src/modules/partner/application-intake/services/submit-partner-application-input.schema';
export type { SubmitPartnerApplicationResult } from 'src/modules/partner/application-intake/services/submit-partner-application.service';

export const SUBMIT_PARTNER_APPLICATION_LOGIC_FUNCTION_ID =
  '7b1e2c5f-3a14-4f7d-8e91-0b5e2a3c4d76';

const APPLICATION_SECRET_HEADER = 'x-application-secret';

export const handler = async (
  event: unknown,
): Promise<SubmitPartnerApplicationResult> => {
  const guard = readSecretGuardedEvent(event, submitPartnerApplicationSchema);
  if (!guard.ok) return { ok: false, reason: guard.reason };
  return submitPartnerApplication(guard.input);
};

export default defineLogicFunction({
  universalIdentifier: SUBMIT_PARTNER_APPLICATION_LOGIC_FUNCTION_ID,
  name: 'submit-partner-application',
  description: 'Receive a partner application from the website and idempotently upsert Partner / Person / Company.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/partner-applications',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [APPLICATION_SECRET_HEADER],
  },
});
