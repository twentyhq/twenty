import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { PERSON_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeCompaniesLastContact } from 'src/utils/recompute-company-last-contact';

type PersonUpdate = { companyId?: string | null };

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<PersonUpdate>>,
): Promise<void> => {
  const companyIds = new Set<string>();

  // Both the person's former and current company can lose or gain their most
  // recent contact when the person moves.
  for (const event of batch.events) {
    for (const companyId of [
      event.properties.before?.companyId,
      event.properties.after?.companyId,
    ]) {
      if (companyId) {
        companyIds.add(companyId);
      }
    }
  }

  if (companyIds.size === 0) {
    return;
  }

  await recomputeCompaniesLastContact(new CoreApiClient(), [...companyIds]);
};

export default defineLogicFunction({
  universalIdentifier: PERSON_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-person-updated',
  description:
    "Recomputes the former and current company's last contact when a person's company changes.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'person.updated',
    updatedFields: ['companyId'],
    batchMode: true,
  },
  handler,
});
