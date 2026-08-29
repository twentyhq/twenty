import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  SELLER_ON_OPPORTUNITY_ID,
  SELLER_OPPORTUNITIES_ON_PERSON_ID,
} from './seller-on-opportunity.field';

export default defineField({
  universalIdentifier: SELLER_OPPORTUNITIES_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'sellerOpportunities',
  label: 'Opportunities as seller',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: SELLER_ON_OPPORTUNITY_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
