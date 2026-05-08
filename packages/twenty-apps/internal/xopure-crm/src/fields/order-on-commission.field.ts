import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';
import { COMMISSIONS_ON_ORDER_FIELD_ID, ORDER_ON_COMMISSION_FIELD_ID } from './order-commissions-on-order.field';

export default defineField({
  universalIdentifier: ORDER_ON_COMMISSION_FIELD_ID,
  objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'order',
  label: 'Order',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: COMMISSIONS_ON_ORDER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'orderId',
  },
});
