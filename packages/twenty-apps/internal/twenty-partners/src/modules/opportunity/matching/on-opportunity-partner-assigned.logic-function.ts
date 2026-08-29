import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { propagatePartnerUser } from 'src/modules/opportunity/matching/services/propagate-partner-user.service';

const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Opportunity>>,
): Promise<Record<string, unknown>> => {
  const { after, before, updatedFields } = payload.properties;
  if (!updatedFields?.includes('partnerId') || !after?.id) return {};
  return propagatePartnerUser(new CoreApiClient(), { opportunityId: after.id, before, after });
};

export default defineLogicFunction({
  // UNCHANGED — kept inline (not in universal-identifiers.ts, which is bundle-local).
  universalIdentifier: 'd7e4a4e6-9142-4597-adcf-6fb83c0f042d',
  name: 'on-opportunity-partner-assigned',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: { eventName: 'opportunity.updated' },
});
