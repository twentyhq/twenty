import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_PAYMENT_OBJECT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
export const XOPURE_PAYMENT_NAME_FIELD_ID = '7c9e6679-7425-40de-944b-e07fc1f84ae2';
export const XOPURE_PAYMENT_STATUS_FIELD_ID = '550e8400-e29b-41d4-a716-446655440000';
export const XOPURE_PAYMENT_ORDER_EXTERNAL_ID_FIELD_ID =
  'b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e';
export const XOPURE_PAYMENT_PROVIDER_FIELD_ID =
  '4ac9fe75-07d4-49df-9357-0a88838b0ba0';
export const XOPURE_PAYMENT_RAIL_FIELD_ID =
  '69158b5f-67b6-4af6-a598-4bbe567c423d';
export const XOPURE_PAYMENT_METHOD_CODE_FIELD_ID =
  '4a6aa409-faa7-4d36-bf8e-d6ee9b8f266b';
export const XOPURE_PAYMENT_AMOUNT_CENTS_FIELD_ID =
  'cf73a32c-47aa-402f-bd29-05130cf88e3d';
export const XOPURE_PAYMENT_CURRENCY_CODE_FIELD_ID =
  '763d7589-6d0f-46b0-be37-a6d5d42b90ba';
export const XOPURE_PAYMENT_PROVIDER_PAYMENT_ID_FIELD_ID =
  '46fbb9a7-b609-4f16-974c-2e00f8101acb';
export const XOPURE_PAYMENT_REFUND_CENTS_FIELD_ID =
  '0abd4d2b-f57b-485a-b46b-4363f7b489c0';
export const XOPURE_PAYMENT_DESCRIPTION_FIELD_ID =
  '04b53871-1ca6-4d7e-a36c-4dc98f3a873e';
export const XOPURE_PAYMENT_LAST_SYNCED_AT_FIELD_ID =
  'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b';

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
    { universalIdentifier: XOPURE_PAYMENT_ORDER_EXTERNAL_ID_FIELD_ID, type: FieldType.TEXT, name: 'orderExternalId', label: 'Order external ID', icon: 'IconShoppingBag' },
    { universalIdentifier: XOPURE_PAYMENT_PROVIDER_FIELD_ID, type: FieldType.TEXT, name: 'provider', label: 'Provider', icon: 'IconBuilding' },
    { universalIdentifier: XOPURE_PAYMENT_RAIL_FIELD_ID, type: FieldType.TEXT, name: 'rail', label: 'Rail', icon: 'IconRoute' },
    { universalIdentifier: XOPURE_PAYMENT_METHOD_CODE_FIELD_ID, type: FieldType.TEXT, name: 'methodCode', label: 'Method code', icon: 'IconBarcode' },
    { universalIdentifier: XOPURE_PAYMENT_AMOUNT_CENTS_FIELD_ID, type: FieldType.NUMBER, name: 'amountCents', label: 'Amount cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: XOPURE_PAYMENT_CURRENCY_CODE_FIELD_ID, type: FieldType.TEXT, name: 'currencyCode', label: 'Currency code', icon: 'IconCoin' },
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
    { universalIdentifier: XOPURE_PAYMENT_PROVIDER_PAYMENT_ID_FIELD_ID, type: FieldType.TEXT, name: 'providerPaymentId', label: 'Provider payment ID', icon: 'IconHash' },
    { universalIdentifier: XOPURE_PAYMENT_REFUND_CENTS_FIELD_ID, type: FieldType.NUMBER, name: 'refundCents', label: 'Refund cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: XOPURE_PAYMENT_DESCRIPTION_FIELD_ID, type: FieldType.TEXT, name: 'description', label: 'Description', icon: 'IconNotes' },
    { universalIdentifier: XOPURE_PAYMENT_LAST_SYNCED_AT_FIELD_ID, type: FieldType.DATE_TIME, name: 'lastSyncedAt', label: 'Last synced at', icon: 'IconRefresh', isNullable: true, defaultValue: null },
  ],
});
