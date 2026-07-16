import {
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import {
  SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_ENGAGEMENT_TERMS_ON_OPPORTUNITY_UNIVERSAL_IDENTIFIER,
  SEARCH_ENGAGEMENT_TERMS_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    SEARCH_ENGAGEMENT_TERMS_ON_OPPORTUNITY_UNIVERSAL_IDENTIFIER,
  name: 'searchEngagementTerms',
  label: 'Engagement terms',
  description: 'Engagement terms linked to the opportunity.',
  type: FieldType.RELATION,
  relationTargetFieldMetadataUniversalIdentifier:
    SEARCH_ENGAGEMENT_TERMS_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  isNullable: true,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
