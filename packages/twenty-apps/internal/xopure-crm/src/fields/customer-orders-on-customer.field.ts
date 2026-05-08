import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { XOPURE_CUSTOMER_OBJECT_ID } from '../objects/xopure-customer.object';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';

export const ORDERS_ON_CUSTOMER_FIELD_ID = '003c91d4-d643-49b5-811b-0762dbc65226';
export const CUSTOMER_ON_ORDER_FIELD_ID = 'af423998-2696-4c1c-987a-9d2d2f86bb09';

export default defineField({
  universalIdentifier: ORDERS_ON_CUSTOMER_FIELD_ID,
  objectUniversalIdentifier: XOPURE_CUSTOMER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'orders',
  label: 'Orders',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: CUSTOMER_ON_ORDER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
