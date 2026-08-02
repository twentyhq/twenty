import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { OPPORTUNITY_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeOpportunityLastContact } from 'src/utils/recompute-opportunity-last-contact';

type OpportunityUpdate = { id?: string | null };

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<OpportunityUpdate>>,
): Promise<void> => {
  const opportunityId = event.properties.after?.id ?? event.recordId;

  if (!opportunityId) {
    return;
  }

  const client = new CoreApiClient();

  await recomputeOpportunityLastContact(client, opportunityId);
};

export default defineLogicFunction({
  universalIdentifier: OPPORTUNITY_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-updated',
  description:
    "Recomputes an opportunity's last contact from its point of contact when the point of contact changes.",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
    updatedFields: ['pointOfContactId'],
  },
  handler,
});
