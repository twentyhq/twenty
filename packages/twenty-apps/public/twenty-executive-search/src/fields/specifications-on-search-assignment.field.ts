import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  POSITION_SPECIFICATION_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SPECIFICATIONS_ON_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    SPECIFICATIONS_ON_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  name: 'positionSpecifications',
  label: 'Position Specifications',
  description: 'Position specifications for this search assignment.',
  type: FieldType.RELATION,
  relationTargetFieldMetadataUniversalIdentifier:
    POSITION_SPECIFICATION_SEARCH_ASSIGNMENT_FIELD_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier:
    POSITION_SPECIFICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEARCH_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  isNullable: true,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
