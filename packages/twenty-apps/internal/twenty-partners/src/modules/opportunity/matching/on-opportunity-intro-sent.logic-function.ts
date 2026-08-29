import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { ON_OPPORTUNITY_INTRO_SENT_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { updateOpportunityIsListed } from 'src/modules/opportunity/matching/graphql/mutations/update-opportunity-is-listed';

export const handler = async (
  payload: DatabaseEventPayload<
    ObjectRecordUpdateEvent<CoreSchema.Opportunity>
  >,
): Promise<Record<string, unknown>> => {
  const { after, updatedFields } = payload.properties;
  if (!updatedFields?.includes('introSentAt') || !after?.id) return {};
  if (!after.introSentAt)
    return { skipped: true, reason: 'intro_sent_at_cleared' };

  await updateOpportunityIsListed(new CoreApiClient(), after.id, false);
  return { unlisted: true, opportunityId: after.id };
};

export default defineLogicFunction({
  universalIdentifier: ON_OPPORTUNITY_INTRO_SENT_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-intro-sent',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
    updatedFields: ['introSentAt'],
  },
});
