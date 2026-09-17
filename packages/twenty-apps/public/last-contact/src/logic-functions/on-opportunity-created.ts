import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { OPPORTUNITY_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeOpportunitiesLastContact } from 'src/utils/recompute-opportunity-last-contact';

type OpportunityCreate = { id?: string | null };

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<OpportunityCreate>>,
): Promise<void> => {
  const opportunityIds = new Set<string>();

  for (const event of batch.events) {
    const opportunityId = event.properties.after.id ?? event.recordId;

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
  universalIdentifier: OPPORTUNITY_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-created',
  description:
    "Computes an opportunity's last contact from its point of contact when the opportunity is created.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.created',
    batchMode: true,
  },
  handler,
});
