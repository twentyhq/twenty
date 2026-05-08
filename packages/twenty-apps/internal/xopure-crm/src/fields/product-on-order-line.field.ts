import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';
import { XOPURE_ORDER_LINE_OBJECT_ID } from '../objects/xopure-order-line.object';
import { XOPURE_PRODUCT_OBJECT_ID } from '../objects/xopure-product.object';
import { ORDER_LINES_ON_PRODUCT_FIELD_ID, PRODUCT_ON_ORDER_LINE_FIELD_ID } from './order-lines-on-product.field';

export default defineField({
  universalIdentifier: PRODUCT_ON_ORDER_LINE_FIELD_ID,
  objectUniversalIdentifier: XOPURE_ORDER_LINE_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'product',
  label: 'Product',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_PRODUCT_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ORDER_LINES_ON_PRODUCT_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'productId',
  },
});
