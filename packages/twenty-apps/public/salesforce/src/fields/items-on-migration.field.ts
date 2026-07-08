import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  ITEMS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER,
  MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_ON_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ITEMS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'items',
  label: 'Items',
  icon: 'IconTable',
  relationTargetObjectMetadataUniversalIdentifier:
    MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    MIGRATION_ON_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
