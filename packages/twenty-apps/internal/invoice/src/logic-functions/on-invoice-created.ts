import {
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { INVOICE_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { deriveTaxType } from 'src/utils/derive-tax-type';

type InvoiceCreate = {
  id?: string | null;
  sellerState?: string | null;
  placeOfSupply?: string | null;
  taxType?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<InvoiceCreate>>,
): Promise<void> => {
  const upserts = batch.events.flatMap((event) => {
    const after = event.properties.after;
    const id = after.id ?? event.recordId;
    const taxType = deriveTaxType(after.sellerState, after.placeOfSupply);

    return id && taxType && taxType !== after.taxType
      ? [{ id, taxType }]
      : [];
  });

  if (upserts.length === 0) {
    return;
  }

  await new CoreApiClient().mutation({
    createInvoices: {
      __args: { data: upserts, upsert: true },
      id: true,
    },
  });
};

export default defineLogicFunction({
  universalIdentifier: INVOICE_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-invoice-created',
  description:
    'Derives tax type (intra-state vs. inter-state) from seller state and place of supply when an invoice is created.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'invoice.created',
    batchMode: true,
  },
  handler,
});
