import {
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { INVOICE_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { deriveTaxType } from 'src/utils/derive-tax-type';

type InvoiceUpdate = {
  id?: string | null;
  sellerState?: string | null;
  placeOfSupply?: string | null;
  taxType?: string | null;
};

const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<InvoiceUpdate>>,
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
  universalIdentifier: INVOICE_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-invoice-updated',
  description:
    'Re-derives tax type (intra-state vs. inter-state) when seller state or place of supply changes.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  databaseEventTriggerSettings: {
    eventName: 'invoice.updated',
    // Scoped to the two comparison inputs only: the handler writes taxType,
    // not these fields, so this can't re-trigger itself.
    updatedFields: ['sellerState', 'placeOfSupply'],
    batchMode: true,
  },
  handler,
});
