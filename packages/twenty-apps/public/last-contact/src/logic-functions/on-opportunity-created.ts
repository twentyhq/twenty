import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { OPPORTUNITY_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeOpportunityLastContact } from 'src/utils/recompute-opportunity-last-contact';

type OpportunityCreate = { id?: string | null };

const handler = async (
  event: DatabaseEventPayload<ObjectRecordCreateEvent<OpportunityCreate>>,
): Promise<void> => {
  const opportunityId = event.properties.after.id ?? event.recordId;

  if (!opportunityId) {
    return;
  }

  const client = new CoreApiClient();

  await recomputeOpportunityLastContact(client, opportunityId);
};

export default defineLogicFunction({
  universalIdentifier: OPPORTUNITY_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-created',
  description:
    "Computes an opportunity's last contact from its point of contact when the opportunity is created.",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.created',
  },
  handler,
});
