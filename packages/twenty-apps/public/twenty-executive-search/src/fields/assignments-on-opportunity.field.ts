import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';

import {
  ASSIGNMENTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ASSIGNMENTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'searchAssignments',
  label: 'Search Assignments',
  description: 'Search assignments associated with this opportunity.',
  type: FieldType.RELATION,
  relationTargetFieldMetadataUniversalIdentifier:
    SEARCH_ASSIGNMENT_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  isNullable: true,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
