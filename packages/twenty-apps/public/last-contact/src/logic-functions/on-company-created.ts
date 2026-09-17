import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { COMPANY_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { recomputeCompaniesLastContact } from 'src/utils/recompute-company-last-contact';

type CompanyCreate = { id?: string | null };

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<CompanyCreate>>,
): Promise<void> => {
  const companyIds = new Set<string>();

  for (const event of batch.events) {
    const companyId = event.properties.after.id ?? event.recordId;

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
  universalIdentifier: COMPANY_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-company-created',
  description:
    "Computes a company's last contact from its people when the company is created.",
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'company.created',
    batchMode: true,
  },
  handler,
});
