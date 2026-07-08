import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  ERRORS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER,
  MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_ON_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MIGRATION_ON_ERROR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'migration',
  label: 'Migration',
  icon: 'IconCloudDownload',
  relationTargetObjectMetadataUniversalIdentifier:
    MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    ERRORS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'migrationId',
  },
});
