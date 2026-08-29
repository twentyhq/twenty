import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { PERSON_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeCompanyLastContact } from 'src/utils/recompute-company-last-contact';

type PersonUpdate = { companyId?: string | null };

const handler = async (
  event: DatabaseEventPayload<ObjectRecordUpdateEvent<PersonUpdate>>,
): Promise<void> => {
  const before = event.properties.before?.companyId ?? null;
  const after = event.properties.after?.companyId ?? null;

  const companyIds = [...new Set([before, after])].filter(
    (id): id is string => Boolean(id),
  );

  if (companyIds.length === 0) {
    return;
  }

  const client = new CoreApiClient();

  // Both the person's former and current company can lose or gain their most
  // recent contact when the person moves.
  for (const companyId of companyIds) {
    await recomputeCompanyLastContact(client, companyId);
  }
};

export default defineLogicFunction({
  universalIdentifier: PERSON_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-person-updated',
  description:
    "Recomputes the former and current company's last contact when a person's company changes.",
  timeoutSeconds: 60,
  databaseEventTriggerSettings: {
    eventName: 'person.updated',
    updatedFields: ['companyId'],
  },
  handler,
});
