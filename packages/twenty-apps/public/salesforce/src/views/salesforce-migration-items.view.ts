import { defineView, ViewKey } from 'twenty-sdk/define';

import {
  MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATION_ITEMS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: MIGRATION_ITEMS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Migration Items',
  objectUniversalIdentifier: MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconTable',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.name,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.name,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier:
        MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.status,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.status,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier:
        MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.salesforceObject,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.salesforceObject,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier:
        MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.targetObject,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.targetObject,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier:
        MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.recordCount,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.recordCount,
      position: 4,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier:
        MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.processedCount,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.processedCount,
      position: 5,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier:
        MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.createdCount,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.createdCount,
      position: 6,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier:
        MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.updatedCount,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.updatedCount,
      position: 7,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier:
        MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.failedCount,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.failedCount,
      position: 8,
      isVisible: true,
      size: 110,
    },
  ],
});
