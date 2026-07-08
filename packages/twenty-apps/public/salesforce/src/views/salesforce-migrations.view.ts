import { defineView, ViewKey } from 'twenty-sdk/define';

import {
  MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATIONS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: MIGRATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Salesforce Migrations',
  objectUniversalIdentifier: MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconCloudDownload',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.name,
      fieldMetadataUniversalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.name,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.status,
      fieldMetadataUniversalIdentifier:
        MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.status,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier:
        MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.totalRecords,
      fieldMetadataUniversalIdentifier:
        MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.totalRecords,
      position: 2,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier:
        MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.processedRecords,
      fieldMetadataUniversalIdentifier:
        MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.processedRecords,
      position: 3,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier:
        MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.createdRecords,
      fieldMetadataUniversalIdentifier:
        MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.createdRecords,
      position: 4,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier:
        MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.failedRecords,
      fieldMetadataUniversalIdentifier:
        MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.failedRecords,
      position: 5,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.startedAt,
      fieldMetadataUniversalIdentifier:
        MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.startedAt,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier:
        MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.completedAt,
      fieldMetadataUniversalIdentifier:
        MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.completedAt,
      position: 7,
      isVisible: true,
      size: 160,
    },
  ],
});
