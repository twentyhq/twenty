import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  CRITERIA_ON_POSITION_SPECIFICATION_FIELD_UNIVERSAL_IDENTIFIER,
  POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
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
  objectUniversalIdentifier: POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  isNullable: true,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
