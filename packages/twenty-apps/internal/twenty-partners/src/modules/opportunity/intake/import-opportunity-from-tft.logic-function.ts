import { defineLogicFunction } from 'twenty-sdk/define';

import { readSecretGuardedEvent } from 'src/modules/shared/http/read-secret-guarded-event';
import { importOpportunityFromTftSchema } from 'src/modules/opportunity/intake/mappers/import-opportunity-from-tft.mapper';
import {
  importOpportunityFromTft,
  type ImportOpportunityFromTftResult,
} from 'src/modules/opportunity/intake/services/import-opportunity-from-tft.service';

export const IMPORT_OPPORTUNITY_FROM_TFT_LOGIC_FUNCTION_ID =
  '4c220eaf-a23f-4af2-8d69-38a6c460019f';

const APPLICATION_SECRET_HEADER = 'x-application-secret';

// isAuthRequired only accepts user JWTs, not API keys; guard with the shared secret.
export const handler = async (event: unknown): Promise<ImportOpportunityFromTftResult> => {
  const guard = readSecretGuardedEvent(event, importOpportunityFromTftSchema);
  if (!guard.ok) return { ok: false, reason: guard.reason };
  return importOpportunityFromTft(guard.input);
};

export default defineLogicFunction({
  universalIdentifier: IMPORT_OPPORTUNITY_FROM_TFT_LOGIC_FUNCTION_ID,
  name: 'import-opportunity-from-tft',
  description:
    'Receive one opportunity pushed from the TFT workspace and create it in partners (find-or-create company + contact, idempotent on tftOpportunityId).',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/opportunities',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [APPLICATION_SECRET_HEADER],
  },
});
