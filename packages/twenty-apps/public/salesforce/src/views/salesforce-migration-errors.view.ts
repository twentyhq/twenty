import { defineView, ViewKey } from 'twenty-sdk/define';

import {
  MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_ERRORS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATION_ERRORS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: MIGRATION_ERRORS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Migration Errors',
  objectUniversalIdentifier: MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconAlertTriangle',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: MIGRATION_ERRORS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.name,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.name,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier:
        MIGRATION_ERRORS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.salesforceObject,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.salesforceObject,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier:
        MIGRATION_ERRORS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.salesforceRecordId,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.salesforceRecordId,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier:
        MIGRATION_ERRORS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.message,
      fieldMetadataUniversalIdentifier:
        MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.message,
      position: 3,
      isVisible: true,
      size: 400,
    },
  ],
});
