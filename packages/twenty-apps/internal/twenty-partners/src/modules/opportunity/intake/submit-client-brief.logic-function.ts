import { defineLogicFunction } from 'twenty-sdk/define';

import { readSecretGuardedEvent } from 'src/modules/shared/http/read-secret-guarded-event';
import { submitClientBriefSchema } from 'src/modules/opportunity/intake/mappers/build-requirements-text.mapper';
import {
  submitClientBrief,
  type SubmitClientBriefResult,
} from 'src/modules/opportunity/intake/services/submit-client-brief.service';

export const SUBMIT_CLIENT_BRIEF_LOGIC_FUNCTION_ID =
  'a8f3c2e1-9b4d-4a7f-8c6e-1d2f3a4b5c6d';

const APPLICATION_SECRET_HEADER = 'x-application-secret';

export const handler = async (event: unknown): Promise<SubmitClientBriefResult> => {
  const guard = readSecretGuardedEvent(event, submitClientBriefSchema);
  if (!guard.ok) return { ok: false, reason: guard.reason };
  return submitClientBrief(guard.input);
};

export default defineLogicFunction({
  universalIdentifier: SUBMIT_CLIENT_BRIEF_LOGIC_FUNCTION_ID,
  name: 'submit-client-brief',
  description: 'Create an unlisted Opportunity from the public marketplace brief form.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/client-briefs',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [APPLICATION_SECRET_HEADER],
  },
});
