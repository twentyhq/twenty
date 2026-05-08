import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { XOPURE_ORDER_OBJECT_ID } from '../objects/xopure-order.object';

export const COMMISSIONS_ON_ORDER_FIELD_ID = '1d45e3cd-e277-41f2-b331-a71d03144cd9';
export const ORDER_ON_COMMISSION_FIELD_ID = '3bd861e3-a1a7-44d6-bcb3-58c9c8738d48';

export default defineField({
  universalIdentifier: COMMISSIONS_ON_ORDER_FIELD_ID,
  objectUniversalIdentifier: XOPURE_ORDER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'commissions',
  label: 'Commissions',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: ORDER_ON_COMMISSION_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
