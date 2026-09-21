import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { OPPORTUNITY_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeOpportunitiesLastContact } from 'src/utils/recompute-opportunity-last-contact';

type OpportunityUpdate = { id?: string | null };

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<OpportunityUpdate>>,
): Promise<void> => {
  const opportunityIds = new Set<string>();

  for (const event of batch.events) {
    const opportunityId = event.properties.after?.id ?? event.recordId;

    if (opportunityId) {
      opportunityIds.add(opportunityId);
    }
  }

  if (opportunityIds.size === 0) {
    return;
  }

  await recomputeOpportunitiesLastContact(new CoreApiClient(), [
    ...opportunityIds,
  ]);
};

export default defineLogicFunction({
  universalIdentifier: OPPORTUNITY_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-updated',
  description:
    "Recomputes an opportunity's last contact from its point of contact when the point of contact changes.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
    updatedFields: ['pointOfContactId'],
    batchMode: true,
  },
  handler,
});
