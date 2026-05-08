import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { XOPURE_ORDER_LINE_OBJECT_ID } from '../objects/xopure-order-line.object';
import { XOPURE_PRODUCT_OBJECT_ID } from '../objects/xopure-product.object';

export const ORDER_LINES_ON_PRODUCT_FIELD_ID = '325f1d9a-ca28-46ca-9877-cbdde8911f87';
export const PRODUCT_ON_ORDER_LINE_FIELD_ID = '77bb3523-fbe3-4af6-a89d-7b2a1b9c50c6';

export default defineField({
  universalIdentifier: ORDER_LINES_ON_PRODUCT_FIELD_ID,
  objectUniversalIdentifier: XOPURE_PRODUCT_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'orderLines',
  label: 'Order lines',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_ORDER_LINE_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: PRODUCT_ON_ORDER_LINE_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
