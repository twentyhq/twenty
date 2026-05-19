import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_PAYMENT_OBJECT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
export const XOPURE_PAYMENT_NAME_FIELD_ID = '7c9e6679-7425-40de-944b-e07fc1f84ae2';
export const XOPURE_PAYMENT_STATUS_FIELD_ID = '550e8400-e29b-41d4-a716-446655440000';

export default defineObject({
  universalIdentifier: XOPURE_PAYMENT_OBJECT_ID,
  nameSingular: 'xopurePayment',
  namePlural: 'xopurePayments',
  labelSingular: 'XO Pure Payment',
  labelPlural: 'XO Pure Payments',
  description: 'Payment tracking synced from Supabase for CRM visibility.',
  icon: 'IconCreditCard',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_PAYMENT_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: XOPURE_PAYMENT_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconCreditCard' },
    { universalIdentifier: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d', type: FieldType.TEXT, name: 'supabasePaymentId', label: 'Supabase payment ID', icon: 'IconDatabase', isUnique: true },
    { universalIdentifier: 'b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e', type: FieldType.TEXT, name: 'orderExternalId', label: 'Order external ID', icon: 'IconShoppingBag' },
    { universalIdentifier: 'c3d4e5f6-7a8b-4c9d-0e1f-2a3b4c5d6e7f', type: FieldType.TEXT, name: 'provider', label: 'Provider', icon: 'IconBuilding' },
    { universalIdentifier: 'd4e5f6a7-8b9c-4d0e-1f2a-3b4c5d6e7f8a', type: FieldType.TEXT, name: 'rail', label: 'Rail', icon: 'IconRoute' },
    { universalIdentifier: 'e5f6a7b8-9c0d-4e1f-2a3b-4c5d6e7f8a9b', type: FieldType.TEXT, name: 'methodCode', label: 'Method code', icon: 'IconBarcode' },
    { universalIdentifier: 'f6a7b8c9-0d1e-4f2a-3b4c-5d6e7f8a9b0c', type: FieldType.NUMBER, name: 'amountCents', label: 'Amount cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: 'a7b8c9d0-1e2f-4a3b-4c5d-6e7f8a9b0c1d', type: FieldType.TEXT, name: 'currency', label: 'Currency', icon: 'IconCoin' },
    {
      universalIdentifier: XOPURE_PAYMENT_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      defaultValue: "'PENDING'",
      options: [
        { id: '11111111-1111-4111-8111-111111111111', value: 'PENDING', label: 'Pending', position: 0, color: 'yellow' },
        { id: '22222222-2222-4222-8222-222222222222', value: 'PROCESSING', label: 'Processing', position: 1, color: 'blue' },
        { id: '33333333-3333-4333-8333-333333333333', value: 'SUCCEEDED', label: 'Succeeded', position: 2, color: 'green' },
        { id: '44444444-4444-4444-8444-444444444444', value: 'FAILED', label: 'Failed', position: 3, color: 'red' },
        { id: '55555555-5555-4555-8555-555555555555', value: 'REFUNDED', label: 'Refunded', position: 4, color: 'orange' },
        { id: '66666666-6666-4666-8666-666666666666', value: 'PARTIALLY_REFUNDED', label: 'Partially refunded', position: 5, color: 'orange' },
        { id: '77777777-7777-4777-8777-777777777777', value: 'CANCELLED', label: 'Cancelled', position: 6, color: 'gray' },
      ],
    },
    { universalIdentifier: 'b8c9d0e1-2f3a-4b4c-5d6e-7f8a9b0c1d2e', type: FieldType.TEXT, name: 'providerPaymentId', label: 'Provider payment ID', icon: 'IconHash' },
    { universalIdentifier: 'c9d0e1f2-3a4b-4c5d-6e7f-8a9b0c1d2e3f', type: FieldType.NUMBER, name: 'refundCents', label: 'Refund cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: 'd0e1f2a3-4b5c-4d6e-7f8a-9b0c1d2e3f4a', type: FieldType.TEXT, name: 'description', label: 'Description', icon: 'IconNotes' },
    { universalIdentifier: 'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b', type: FieldType.DATE_TIME, name: 'lastSyncedAt', label: 'Last synced at', icon: 'IconRefresh', isNullable: true, defaultValue: null },
  ],
});
