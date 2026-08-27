import { type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { notifyListedBrief } from 'src/modules/opportunity/matching/services/notify-listed-brief.service';

// The public form is NOT this function's job: form briefs are born listed and never
// flip, so the in-route ping covers them. This covers hand-listing and imports.
export const handler = async (
  payload: DatabaseEventPayload<
    ObjectRecordUpdateEvent<CoreSchema.Opportunity>
  >,
): Promise<Record<string, unknown>> => {
  const { before, after, updatedFields } = payload.properties;
  if (!updatedFields?.includes('isListed') || !after?.id) return {};
  if (before?.isListed || !after.isListed) {
    return { skipped: true, reason: 'not_a_listing_flip' };
  }

  const notified = await notifyListedBrief(after.id);
  return { notified, opportunityId: after.id };
};

export default defineLogicFunction({
  universalIdentifier: ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-listed',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
    updatedFields: ['isListed'],
  },
});
