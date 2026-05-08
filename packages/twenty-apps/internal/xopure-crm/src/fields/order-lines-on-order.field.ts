import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { XOPURE_ORDER_LINE_OBJECT_ID } from '../objects/xopure-order-line.object';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';

export const ORDER_LINES_ON_ORDER_FIELD_ID = '2cea5237-fbe2-4053-8b51-a6c1930c3929';
export const ORDER_ON_ORDER_LINE_FIELD_ID = 'a7ed696a-de33-4f74-8371-8c9c356b09b1';

export default defineField({
  universalIdentifier: ORDER_LINES_ON_ORDER_FIELD_ID,
  objectUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'orderLines',
  label: 'Order lines',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_ORDER_LINE_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ORDER_ON_ORDER_LINE_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
