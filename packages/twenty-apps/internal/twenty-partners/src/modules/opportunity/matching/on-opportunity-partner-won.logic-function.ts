import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { syncApplicationOutcomes } from 'src/modules/opportunity/matching/services/sync-application-outcomes.service';

export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Opportunity>>,
): Promise<Record<string, unknown>> => {
  const { after, updatedFields } = payload.properties;
  if (!updatedFields?.includes('partnerId') || !after?.id) return {};
  return syncApplicationOutcomes(new CoreApiClient(), {
    opportunityId: after.id,
    newPartnerId: after.partnerId ?? null,
  });
};

export default defineLogicFunction({
  universalIdentifier: '683f407e-e7a0-435d-a380-e51e536770f8',
  name: 'on-opportunity-partner-won',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: { eventName: 'opportunity.updated' },
});
