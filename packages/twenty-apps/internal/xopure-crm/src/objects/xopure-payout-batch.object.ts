import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_PAYOUT_BATCH_OBJECT_ID = 'bcf0befc-4821-4a8f-b016-12a6be9d49a3';
export const XOPURE_PAYOUT_BATCH_NAME_FIELD_ID = 'de6a1257-53b6-42a3-a630-a99f17dd3b0c';
export const XOPURE_PAYOUT_BATCH_STATUS_FIELD_ID = 'fd9e38e3-a7ab-402d-bbb0-8663a94a3d3e';

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
        { id: 'f034144a-4e62-420c-9e86-84578c0f213b', value: 'PROCESSING', label: 'Processing', position: 2, color: 'yellow' },
        { id: 'ed84b083-8997-4f5d-9f8a-18d3193e35e6', value: 'COMPLETED', label: 'Completed', position: 3, color: 'green' },
        { id: '6496cbe7-0bc6-45fd-8630-3b4d4d381bc7', value: 'FAILED', label: 'Failed', position: 4, color: 'red' },
      ],
    },
    { universalIdentifier: 'f1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', type: FieldType.NUMBER, name: 'totalCents', label: 'Total cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: 'a2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', type: FieldType.TEXT, name: 'currencyCode', label: 'Currency code', icon: 'IconCash', defaultValue: "'USD'" },
    { universalIdentifier: '6b30f4e3-cb1f-433d-9984-37fba2e7e956', type: FieldType.NUMBER, name: 'commissionCount', label: 'Commission count', icon: 'IconHash', defaultValue: 0 },
    { universalIdentifier: '51f728b3-3a3b-4f12-9f6a-e5819d7aa662', type: FieldType.DATE_TIME, name: 'submittedAt', label: 'Submitted at', icon: 'IconCalendarEvent', isNullable: true, defaultValue: null },
    { universalIdentifier: '1705d8db-2853-4e46-8894-f4af8d5fef57', type: FieldType.DATE_TIME, name: 'completedAt', label: 'Completed at', icon: 'IconCalendarCheck', isNullable: true, defaultValue: null },
    { universalIdentifier: '6db25c4b-8a2b-49c4-bfc4-650fe3da1b03', type: FieldType.TEXT, name: 'providerReference', label: 'Provider reference', icon: 'IconExternalLink' },
    { universalIdentifier: '7db30ce3-f7c4-4009-809a-5e40eb0c5797', type: FieldType.TEXT, name: 'notes', label: 'Notes', icon: 'IconNotes' },
  ],
});
