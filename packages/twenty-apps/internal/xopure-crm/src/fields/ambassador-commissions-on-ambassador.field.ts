import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';

export const COMMISSIONS_ON_AMBASSADOR_FIELD_ID = '04abf88e-3d61-44d4-b449-15f04a9b6736';
export const AMBASSADOR_ON_COMMISSION_FIELD_ID = '86d0b6ef-698e-4548-86ba-4e88a787a49f';

export default defineField({
  universalIdentifier: COMMISSIONS_ON_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'commissions',
  label: 'Commissions',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: AMBASSADOR_ON_COMMISSION_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
