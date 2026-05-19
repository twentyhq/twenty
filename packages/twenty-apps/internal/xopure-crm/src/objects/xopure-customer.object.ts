import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_CUSTOMER_OBJECT_ID = '26f53175-0804-4ab4-9d59-b6e9081dff61';
export const XOPURE_CUSTOMER_NAME_FIELD_ID = '8a3e6d06-3a92-43f7-8bfa-54dd520f88b1';
export const XOPURE_CUSTOMER_STATUS_FIELD_ID = 'a9d72f39-cf69-4343-a83c-3b7b84fe66d8';
export const XOPURE_CUSTOMER_TAGS_FIELD_ID = '390836d7-f58b-49f2-9fbc-1b6e0d2d2394';
export const XOPURE_CUSTOMER_LTV_FIELD_ID = '99155890-bb8a-4c36-a034-201a8dbb1439';
export const XOPURE_CUSTOMER_ORDER_COUNT_FIELD_ID = 'e3817957-c777-452a-b67c-0fa64e905f25';
export const XOPURE_CUSTOMER_LAST_SYNCED_AT_FIELD_ID = '1175136b-1b4e-4e4b-b50a-ce737ec1bb27';

export default defineObject({
  universalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
  nameSingular: 'xopureCustomer',
  namePlural: 'xopureCustomers',
  labelSingular: 'XO Pure Customer',
  labelPlural: 'XO Pure Customers',
  description: 'Synced customer profile from XO Pure commerce and Supabase systems.',
  icon: 'IconUserHeart',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_CUSTOMER_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: XOPURE_CUSTOMER_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconUser',
    },
    {
      universalIdentifier: 'afc4ed4e-edfb-4522-a41b-47244f94aa76',
      type: FieldType.TEXT,
      name: 'supabaseCustomerId',
      label: 'Supabase customer ID',
      icon: 'IconDatabase',
      isUnique: true,
    },
    {
      universalIdentifier: '4361ae7b-401d-41c2-aa99-76867656d1e1',
      type: FieldType.TEXT,
      name: 'email',
      label: 'Email',
      icon: 'IconMail',
    },
    {
      universalIdentifier: 'ef1cd361-f73e-4e0d-ab75-c1e3f94b49d3',
      type: FieldType.TEXT,
      name: 'commerceCustomerId',
      label: 'Commerce customer ID',
      icon: 'IconShoppingCart',
    },
    {
      universalIdentifier: XOPURE_CUSTOMER_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconUserCheck',
      defaultValue: "'ACTIVE'",
      options: [
        { id: '00a0dc6c-83fb-4a5b-a3d1-db5c213ec139', value: 'ACTIVE', label: 'Active', position: 0, color: 'green' },
        { id: '0c0fc0c3-eddd-4155-8792-3dc5b1cfc611', value: 'VIP', label: 'VIP', position: 1, color: 'purple' },
        { id: '057ea36d-eabf-4c6d-b3f1-6c67fd020313', value: 'AT_RISK', label: 'At risk', position: 2, color: 'orange' },
        { id: '27219142-7f13-46dd-a8fc-f58b9e102fd6', value: 'INACTIVE', label: 'Inactive', position: 3, color: 'gray' },
      ],
    },
    {
      universalIdentifier: XOPURE_CUSTOMER_TAGS_FIELD_ID,
      type: FieldType.MULTI_SELECT,
      name: 'coreTags',
      label: 'Core tags',
      icon: 'IconTags',
      defaultValue: ["'CUSTOMER'"],
      options: [
        { id: '434d3631-d20d-4665-b861-1001c738de85', value: 'CUSTOMER', label: 'Customer', position: 0, color: 'green' },
        { id: '897910bb-746c-4a6a-bae6-2193021a8af2', value: 'AMBASSADOR', label: 'Ambassador', position: 1, color: 'blue' },
        { id: '27ca881d-a135-4169-ac13-efdd1e527c7e', value: 'WHOLESALE', label: 'Wholesale', position: 2, color: 'yellow' },
        { id: '0b218638-eacb-4ded-afca-2644dad1c2fa', value: 'SUBSCRIPTION', label: 'Subscription', position: 3, color: 'turquoise' },
        { id: '06f4e9ff-4ce0-4ee1-b439-209f080cdf57', value: 'VIP', label: 'VIP', position: 4, color: 'purple' },
      ],
    },
    {
      universalIdentifier: XOPURE_CUSTOMER_LTV_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'lifetimeValue',
      label: 'Lifetime value',
      icon: 'IconCurrencyDollar',
      defaultValue: 0,
    },
    {
      universalIdentifier: '5a26fa28-82a2-4c46-8d4b-3ff31725c6cd',
      type: FieldType.NUMBER,
      name: 'lifetimeValueCents',
      label: 'Lifetime value cents',
      icon: 'IconCurrencyDollar',
      defaultValue: 0,
    },
    {
      universalIdentifier: XOPURE_CUSTOMER_ORDER_COUNT_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'orderCount',
      label: 'Order count',
      icon: 'IconReceipt',
      defaultValue: 0,
    },
    {
      universalIdentifier: 'f97389fa-39f0-4fbe-b06f-c169ae850528',
      type: FieldType.DATE_TIME,
      name: 'lastOrderAt',
      label: 'Last order at',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: XOPURE_CUSTOMER_LAST_SYNCED_AT_FIELD_ID,
      type: FieldType.DATE_TIME,
      name: 'lastSyncedAt',
      label: 'Last synced at',
      icon: 'IconRefresh',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
