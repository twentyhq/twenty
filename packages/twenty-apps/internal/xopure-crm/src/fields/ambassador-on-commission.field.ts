import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_COMMISSION_OBJECT_ID } from '../objects/xopure-commission.object';
import { AMBASSADOR_ON_COMMISSION_FIELD_ID, COMMISSIONS_ON_AMBASSADOR_FIELD_ID } from './ambassador-commissions-on-ambassador.field';

export default defineField({
  universalIdentifier: AMBASSADOR_ON_COMMISSION_FIELD_ID,
  objectUniversalIdentifier: XOPURE_COMMISSION_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'ambassador',
  label: 'Ambassador',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: COMMISSIONS_ON_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'ambassadorId',
  },
});
