import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  ITEMS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER,
  MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_ON_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: MIGRATION_ON_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'migration',
  label: 'Migration',
  icon: 'IconCloudDownload',
  relationTargetObjectMetadataUniversalIdentifier:
    MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    ITEMS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'migrationId',
  },
});
