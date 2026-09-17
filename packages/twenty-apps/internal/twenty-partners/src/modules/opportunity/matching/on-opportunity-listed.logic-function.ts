import { type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { notifyListedBrief } from 'src/modules/opportunity/matching/services/notify-listed-brief.service';

// Form briefs are born unlisted and reach the marketplace only when an admin lists them,
// so this fires for them as well as for imports and hand-created briefs.
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
