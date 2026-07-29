import { defineLogicFunction, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';
import { type DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { OPPORTUNITY_POINT_OF_CONTACT_CHANGED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { syncOpportunityLastContact } from 'src/utils/sync-opportunity-last-contact';

type OpportunityUpdate = {
  id?: string | null;
  pointOfContactId?: string | null;
};

// The write this performs only touches last-contact fields, so the resulting
// opportunity.updated event is filtered out by updatedFields and cannot loop.
const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<OpportunityUpdate>>,
): Promise<void> => {
  const opportunityId = event.recordId ?? event.properties.after.id;

  if (!opportunityId) {
    return;
  }

  await syncOpportunityLastContact(new CoreApiClient(), {
    opportunityId,
    pointOfContactId: event.properties.after.pointOfContactId ?? null,
  });
};

export default defineLogicFunction({
  universalIdentifier:
    OPPORTUNITY_POINT_OF_CONTACT_CHANGED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-point-of-contact-changed',
  description:
    "Recomputes an opportunity's last contact from its point of contact when that point of contact is set, changed or cleared.",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
    updatedFields: ['pointOfContactId'],
  },
  handler,
});
