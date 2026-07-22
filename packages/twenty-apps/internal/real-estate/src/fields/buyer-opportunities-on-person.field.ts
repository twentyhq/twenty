import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  BUYER_ON_OPPORTUNITY_ID,
  BUYER_OPPORTUNITIES_ON_PERSON_ID,
} from './buyer-on-opportunity.field';

export default defineField({
  universalIdentifier: BUYER_OPPORTUNITIES_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'buyerOpportunities',
  label: 'Opportunities as buyer',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: BUYER_ON_OPPORTUNITY_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
