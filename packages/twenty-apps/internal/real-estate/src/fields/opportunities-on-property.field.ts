import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';
import {
  OPPORTUNITIES_ON_PROPERTY_ID,
  PROPERTY_ON_OPPORTUNITY_ID,
} from './property-on-opportunity.field';

export default defineField({
  universalIdentifier: OPPORTUNITIES_ON_PROPERTY_ID,
  objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'opportunities',
  label: 'Opportunities',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PROPERTY_ON_OPPORTUNITY_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
