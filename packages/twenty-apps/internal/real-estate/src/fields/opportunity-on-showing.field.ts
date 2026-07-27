import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';

export const OPPORTUNITY_ON_SHOWING_ID =
  '69fa9f30-dc06-4c2c-b6e5-79351c7a52c8';
export const SHOWINGS_ON_OPPORTUNITY_ID =
  '4f296937-b62c-4e43-9316-6278148909c4';

export default defineField({
  universalIdentifier: OPPORTUNITY_ON_SHOWING_ID,
  objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'opportunity',
  label: 'Opportunity',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: SHOWINGS_ON_OPPORTUNITY_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'opportunityId',
  },
});
