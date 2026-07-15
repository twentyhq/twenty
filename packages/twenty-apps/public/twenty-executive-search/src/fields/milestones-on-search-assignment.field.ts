import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  MILESTONES_ON_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONE_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_MILESTONE_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    MILESTONES_ON_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'searchMilestones',
  label: 'Milestones',
  description: 'Milestones associated with this search assignment.',
  type: FieldType.RELATION,
  relationTargetFieldMetadataUniversalIdentifier:
    SEARCH_MILESTONE_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    SEARCH_MILESTONE_OBJECT_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  isNullable: true,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
