import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';

export const ORDERS_ON_AMBASSADOR_FIELD_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
export const AMBASSADOR_ON_ORDER_FIELD_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

export default defineField({
  universalIdentifier: ORDERS_ON_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'orders',
  label: 'Orders',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: AMBASSADOR_ON_ORDER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconShoppingBag',
});
