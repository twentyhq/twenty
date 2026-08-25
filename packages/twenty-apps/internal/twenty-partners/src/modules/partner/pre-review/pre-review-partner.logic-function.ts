import { type CoreSchema, CoreApiClient } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { PRE_REVIEW_PARTNER_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { preReviewPartner } from 'src/modules/partner/pre-review/services/pre-review-partner.service';

export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.Partner>>,
): Promise<Record<string, unknown>> => {
  const after = payload.properties.after;
  if (!after?.id) return {};

  // Form-only: the installed app stamps createdBy.source = 'APPLICATION'.
  // Seed/import authenticate via API key (API); the UI is MANUAL — both skipped.
  if (after.createdBy?.source !== 'APPLICATION') return {};

  return preReviewPartner(new CoreApiClient(), after.id);
};

export default defineLogicFunction({
  universalIdentifier: PRE_REVIEW_PARTNER_FN_UNIVERSAL_IDENTIFIER,
  name: 'pre-review-partner',
  description:
    'Grades a newly created partner application: fetches its public links, asks the pre-review agent, then writes preReviewVerdict and a dossier Note.',
  timeoutSeconds: 300,
  handler,
  databaseEventTriggerSettings: { eventName: 'partner.created' },
});
