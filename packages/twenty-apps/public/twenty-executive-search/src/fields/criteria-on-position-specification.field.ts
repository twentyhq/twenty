import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  CRITERIA_ON_POSITION_SPECIFICATION_FIELD_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERION_OBJECT_UNIVERSAL_IDENTIFIER,
  SEARCH_CRITERION_POSITION_SPECIFICATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    CRITERIA_ON_POSITION_SPECIFICATION_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'searchCriteria',
  label: 'Search Criteria',
  description: 'Search criteria for this position specification.',
  type: FieldType.RELATION,
  relationTargetFieldMetadataUniversalIdentifier:
    SEARCH_CRITERION_POSITION_SPECIFICATION_FIELD_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    SEARCH_CRITERION_OBJECT_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90',
  isNullable: true,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
