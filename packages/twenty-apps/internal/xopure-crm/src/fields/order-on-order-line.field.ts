import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';
import { XOPURE_ORDER_LINE_OBJECT_ID } from '../objects/xopure-order-line.object';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';
import { ORDER_LINES_ON_ORDER_FIELD_ID, ORDER_ON_ORDER_LINE_FIELD_ID } from './order-lines-on-order.field';

export default defineField({
  universalIdentifier: ORDER_ON_ORDER_LINE_FIELD_ID,
  objectUniversalIdentifier: XOPURE_ORDER_LINE_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'order',
  label: 'Order',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ORDER_LINES_ON_ORDER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'orderId',
  },
});
