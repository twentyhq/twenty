import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_ORDER_OBJECT_ID = '903d03d4-f6ff-4f63-a9ee-30bacaf495cc';
export const XOPURE_ORDER_NUMBER_FIELD_ID = '9012b2ab-85fb-4d49-acb3-f0a826fe6335';
export const XOPURE_ORDER_STATUS_FIELD_ID = '46264b64-f6eb-4407-930b-265e22da8e99';

export default defineObject({
  universalIdentifier: XOPURE_ORDER_OBJECT_ID,
  nameSingular: 'xopureOrder',
  namePlural: 'xopureOrders',
  labelSingular: 'XO Pure Order',
  labelPlural: 'XO Pure Orders',
  description: 'Synced customer order summary for CRM visibility and ambassador attribution.',
  icon: 'IconShoppingBag',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_ORDER_NUMBER_FIELD_ID,
  fields: [
    { universalIdentifier: XOPURE_ORDER_NUMBER_FIELD_ID, type: FieldType.TEXT, name: 'orderNumber', label: 'Order number', icon: 'IconHash' },
    { universalIdentifier: '2af7359a-9d2b-42f8-b9f4-37acf0c60583', type: FieldType.TEXT, name: 'supabaseOrderId', label: 'Supabase order ID', icon: 'IconDatabase' },
    { universalIdentifier: '537fe0dd-910d-46fd-a0fe-9202a45f7855', type: FieldType.TEXT, name: 'commerceOrderId', label: 'Commerce order ID', icon: 'IconShoppingCart' },
    {
      universalIdentifier: XOPURE_ORDER_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconTruckDelivery',
      defaultValue: "'OPEN'",
      options: [
        { id: '671aedfe-52b4-42ef-9414-03e485325488', value: 'OPEN', label: 'Open', position: 0, color: 'blue' },
        { id: 'dcffca58-0c53-4594-940c-ac6e1cb19bfa', value: 'PAID', label: 'Paid', position: 1, color: 'green' },
        { id: '99bebb59-fcbd-4e2d-b223-e819de94032b', value: 'FULFILLED', label: 'Fulfilled', position: 2, color: 'turquoise' },
        { id: '1cddb897-a385-4cf9-b0d7-6aec1b5545c9', value: 'REFUNDED', label: 'Refunded', position: 3, color: 'orange' },
        { id: '629ae8d1-e14a-48ef-8376-44dca6ddcef4', value: 'CANCELLED', label: 'Cancelled', position: 4, color: 'red' },
      ],
    },
    { universalIdentifier: 'e4954e0b-e7c4-409e-9532-3b3a8461d345', type: FieldType.NUMBER, name: 'orderTotal', label: 'Order total', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: '97910878-6e68-4bd4-8de1-bd03aaae7b08', type: FieldType.DATE_TIME, name: 'orderedAt', label: 'Ordered at', icon: 'IconCalendar', isNullable: true, defaultValue: null },
    { universalIdentifier: '46c6570c-e10b-4167-a99b-40fda023a502', type: FieldType.TEXT, name: 'customerExternalId', label: 'Customer external ID', icon: 'IconUser' },
    { universalIdentifier: '4eebd2c5-2838-4986-bd73-d1dd2fb047df', type: FieldType.TEXT, name: 'ambassadorCode', label: 'Ambassador code', icon: 'IconTicket' },
    { universalIdentifier: 'a038a856-b985-4aa7-8f58-b06fe6c27199', type: FieldType.BOOLEAN, name: 'commissionable', label: 'Commissionable', icon: 'IconCash', defaultValue: false },
  ],
});
