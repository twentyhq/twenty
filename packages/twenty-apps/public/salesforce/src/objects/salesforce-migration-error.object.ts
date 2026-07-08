import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'salesforceMigrationError',
  namePlural: 'salesforceMigrationErrors',
  labelSingular: 'Salesforce Migration Error',
  labelPlural: 'Salesforce Migration Errors',
  description:
    'A record that could not be migrated, with the reason and the original Salesforce data for inspection and replay.',
  icon: 'IconAlertTriangle',
  labelIdentifierFieldMetadataUniversalIdentifier:
    MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.name,
  fields: [
    {
      universalIdentifier: MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier:
        MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.salesforceObject,
      type: FieldType.TEXT,
      name: 'salesforceObject',
      label: 'Salesforce object',
      icon: 'IconCloud',
    },
    {
      universalIdentifier:
        MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.salesforceRecordId,
      type: FieldType.TEXT,
      name: 'salesforceRecordId',
      label: 'Salesforce record Id',
      icon: 'IconId',
    },
    {
      universalIdentifier: MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.message,
      type: FieldType.TEXT,
      name: 'message',
      label: 'Error message',
      icon: 'IconExclamationCircle',
    },
    {
      universalIdentifier: MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS.recordData,
      type: FieldType.RAW_JSON,
      name: 'recordData',
      label: 'Record data',
      description: 'The original Salesforce record as fetched at migration time.',
      icon: 'IconJson',
    },
  ],
});
