import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_PAYOUT_BATCH_OBJECT_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
export const XOPURE_PAYOUT_BATCH_NAME_FIELD_ID = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
export const XOPURE_PAYOUT_BATCH_STATUS_FIELD_ID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';

export default defineObject({
  universalIdentifier: XOPURE_PAYOUT_BATCH_OBJECT_ID,
  nameSingular: 'xopurePayoutBatch',
  namePlural: 'xopurePayoutBatches',
  labelSingular: 'XO Pure Payout Batch',
  labelPlural: 'XO Pure Payout Batches',
  description: 'Commission payout batch tracking for ambassador operations.',
  icon: 'IconCashBanknote',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_PAYOUT_BATCH_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: XOPURE_PAYOUT_BATCH_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconReceipt' },
    {
      universalIdentifier: XOPURE_PAYOUT_BATCH_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      defaultValue: "'DRAFT'",
      options: [
        { id: 'a1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e', value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
        { id: 'b2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f', value: 'SUBMITTED', label: 'Submitted', position: 1, color: 'blue' },
        { id: 'c3e4f5a6-b7c8-4d9e-0f1a-2b3c4d5e6f70', value: 'PROCESSING', label: 'Processing', position: 2, color: 'yellow' },
        { id: 'd4f5a6b7-c8d9-4e0f-1a2b-3c4d5e6f7081', value: 'COMPLETED', label: 'Completed', position: 3, color: 'green' },
        { id: 'e5a6b7c8-d9e0-4f1a-2b3c-4d5e6f708192', value: 'FAILED', label: 'Failed', position: 4, color: 'red' },
      ],
    },
    { universalIdentifier: 'f1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', type: FieldType.NUMBER, name: 'totalCents', label: 'Total cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: 'a2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', type: FieldType.TEXT, name: 'currency', label: 'Currency', icon: 'IconCash', defaultValue: "'USD'" },
    { universalIdentifier: 'b3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', type: FieldType.NUMBER, name: 'commissionCount', label: 'Commission count', icon: 'IconHash', defaultValue: 0 },
    { universalIdentifier: 'c4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80', type: FieldType.DATE_TIME, name: 'submittedAt', label: 'Submitted at', icon: 'IconCalendarEvent', isNullable: true, defaultValue: null },
    { universalIdentifier: 'd5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091', type: FieldType.DATE_TIME, name: 'completedAt', label: 'Completed at', icon: 'IconCalendarCheck', isNullable: true, defaultValue: null },
    { universalIdentifier: 'e6a7b8c9-d0e1-4f2a-3b4c-5d6e7f80912a', type: FieldType.TEXT, name: 'providerReference', label: 'Provider reference', icon: 'IconExternalLink' },
    { universalIdentifier: 'f7b8c9d0-e1f2-4a3b-4c5d-6e7f80912a3b', type: FieldType.TEXT, name: 'notes', label: 'Notes', icon: 'IconNotes' },
  ],
});
