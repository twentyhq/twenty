import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  ERRORS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER,
  MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_ON_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ERRORS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'errors',
  label: 'Errors',
  icon: 'IconAlertTriangle',
  relationTargetObjectMetadataUniversalIdentifier:
    MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    MIGRATION_ON_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
