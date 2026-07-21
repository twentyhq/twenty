import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';

export const PROPERTY_ON_SHOWING_ID = '833124c5-4c9d-4921-aae9-fc5a235cc04e';
export const SHOWINGS_ON_PROPERTY_ID = 'ff848464-396a-4feb-a2b7-3aa28c1e3857';

export default defineField({
  universalIdentifier: PROPERTY_ON_SHOWING_ID,
  objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'property',
  label: 'Property',
  icon: 'IconHome',
  relationTargetObjectMetadataUniversalIdentifier:
    PROPERTY_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: SHOWINGS_ON_PROPERTY_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'propertyId',
  },
});
