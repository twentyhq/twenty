import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { PERSON_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeCompaniesLastContact } from 'src/utils/recompute-company-last-contact';

type PersonCreate = { companyId?: string | null };

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<PersonCreate>>,
): Promise<void> => {
  const companyIds = new Set<string>();

  for (const event of batch.events) {
    const companyId = event.properties.after.companyId;

    if (companyId) {
      companyIds.add(companyId);
    }
  }

  if (companyIds.size === 0) {
    return;
  }

  await recomputeCompaniesLastContact(new CoreApiClient(), [...companyIds]);
};

export default defineLogicFunction({
  universalIdentifier: PERSON_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-person-created',
  description:
    "Recomputes the company's last contact when a person is created with a company.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'person.created',
    batchMode: true,
  },
  handler,
});
