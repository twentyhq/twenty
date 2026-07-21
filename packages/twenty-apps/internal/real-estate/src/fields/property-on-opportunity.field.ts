import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';

export const PROPERTY_ON_OPPORTUNITY_ID =
  '899dff13-3962-468c-ac8d-cdb10eac7621';
export const OPPORTUNITIES_ON_PROPERTY_ID =
  'f3b50c66-2096-486b-bedc-2261c537b5dd';

export default defineField({
  universalIdentifier: PROPERTY_ON_OPPORTUNITY_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'property',
  label: 'Property',
  icon: 'IconHome',
  relationTargetObjectMetadataUniversalIdentifier:
    PROPERTY_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: OPPORTUNITIES_ON_PROPERTY_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'propertyId',
  },
});
