import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_COMMISSION_OBJECT_ID = '7b0ddca6-0ca4-4bf6-9be7-52f7b9e42290';
export const XOPURE_COMMISSION_NAME_FIELD_ID = 'ea327d54-664c-4862-b8fd-509a930d79ee';
export const XOPURE_COMMISSION_STATUS_FIELD_ID = '79685a05-73a7-40f8-8ad1-e19fb0e9f9b6';

export default defineObject({
  universalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  nameSingular: 'xopureCommission',
  namePlural: 'xopureCommissions',
  labelSingular: 'XO Pure Commission',
  labelPlural: 'XO Pure Commissions',
  description: 'Ambassador commission and payout tracking.',
  icon: 'IconReceiptDollar',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_COMMISSION_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: XOPURE_COMMISSION_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconReceipt' },
    { universalIdentifier: 'f5bb2878-ee16-4ae0-9ac8-b29deabb6cc2', type: FieldType.TEXT, name: 'supabaseCommissionId', label: 'Supabase commission ID', icon: 'IconDatabase', isUnique: true },
    { universalIdentifier: 'ec0498cf-ca3b-42a9-b583-2110ecb3e849', type: FieldType.TEXT, name: 'ambassadorExternalId', label: 'Ambassador external ID', icon: 'IconUserStar' },
    { universalIdentifier: '8fe7846d-79c9-4e7c-a96d-a86f9711d1ac', type: FieldType.TEXT, name: 'orderExternalId', label: 'Order external ID', icon: 'IconShoppingBag' },
    { universalIdentifier: '12f98239-0d32-431b-8f5d-ccd346552e0b', type: FieldType.NUMBER, name: 'amount', label: 'Amount', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: 'eea01e8f-cff9-4b95-91ed-d701458455b4', type: FieldType.NUMBER, name: 'amountCents', label: 'Amount cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: '9e5c9ae3-0ffb-466a-aac4-0b5637258976', type: FieldType.NUMBER, name: 'rate', label: 'Rate %', icon: 'IconPercentage', defaultValue: 0 },
    {
      universalIdentifier: XOPURE_COMMISSION_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      defaultValue: "'PENDING'",
      options: [
        { id: '9c2f6a27-0e60-46b1-845a-fda67663a636', value: 'PENDING', label: 'Pending', position: 0, color: 'yellow' },
        { id: '573a2bc3-6476-4879-8ae8-af06b4b397d4', value: 'APPROVED', label: 'Approved', position: 1, color: 'blue' },
        { id: 'a9dd86cd-3b34-4860-ba28-f64dcb5f98fe', value: 'PAID', label: 'Paid', position: 2, color: 'green' },
        { id: '86a04db3-ac57-4180-8871-e6ead06fc076', value: 'VOID', label: 'Void', position: 3, color: 'red' },
        { id: 'b0688a9c-09c2-4534-ae57-3552e0ba24f1', value: 'HELD', label: 'Held', position: 4, color: 'orange' },
      ],
    },
    { universalIdentifier: '3f9d3f50-f6da-47de-a581-b6b8a485b0ec', type: FieldType.DATE_TIME, name: 'paidAt', label: 'Paid at', icon: 'IconCalendarCheck', isNullable: true, defaultValue: null },
    { universalIdentifier: '97f6ed93-a8a5-4265-be70-0e5c0ae22942', type: FieldType.TEXT, name: 'payArea', label: 'Pay area', icon: 'IconMapPin' },
    { universalIdentifier: '9b7b2b88-fc5b-4ea7-83c6-42a028b7b4c2', type: FieldType.TEXT, name: 'periodId', label: 'Period ID', icon: 'IconCalendar' },
    { universalIdentifier: '6eb2b636-17dc-48d7-8b35-a1d353cd5036', type: FieldType.DATE_TIME, name: 'holdUntil', label: 'Hold until', icon: 'IconClock', isNullable: true, defaultValue: null },
    { universalIdentifier: '7bb0c03f-4a5e-438a-8985-0702924d8b0f', type: FieldType.NUMBER, name: 'baseCvAmount', label: 'Base CV amount', icon: 'IconChartBar', defaultValue: 0 },
    { universalIdentifier: '0226b7a4-544d-49c4-a625-a55c0a4e80b7', type: FieldType.DATE_TIME, name: 'lastSyncedAt', label: 'Last synced at', icon: 'IconRefresh', isNullable: true, defaultValue: null },
  ],
});
