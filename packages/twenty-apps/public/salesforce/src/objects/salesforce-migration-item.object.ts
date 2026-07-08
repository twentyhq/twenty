import { defineObject, FieldType } from 'twenty-sdk/define';

import { MIGRATION_ITEM_STATUS } from 'src/constants/migration-status';
import {
  MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_ITEM_STATUS_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'salesforceMigrationItem',
  namePlural: 'salesforceMigrationItems',
  labelSingular: 'Salesforce Migration Item',
  labelPlural: 'Salesforce Migration Items',
  description:
    'One Salesforce object within a migration: its target, field mapping, and live per-object progress.',
  icon: 'IconTable',
  labelIdentifierFieldMetadataUniversalIdentifier:
    MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.name,
  fields: [
    {
      universalIdentifier: MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.status,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      isNullable: false,
      defaultValue: `'${MIGRATION_ITEM_STATUS.PENDING}'`,
      options: [
        {
          id: MIGRATION_ITEM_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.pending,
          value: MIGRATION_ITEM_STATUS.PENDING,
          label: 'Pending',
          position: 0,
          color: 'blue',
        },
        {
          id: MIGRATION_ITEM_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.running,
          value: MIGRATION_ITEM_STATUS.RUNNING,
          label: 'Running',
          position: 1,
          color: 'turquoise',
        },
        {
          id: MIGRATION_ITEM_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.completed,
          value: MIGRATION_ITEM_STATUS.COMPLETED,
          label: 'Completed',
          position: 2,
          color: 'green',
        },
        {
          id: MIGRATION_ITEM_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.completedWithErrors,
          value: MIGRATION_ITEM_STATUS.COMPLETED_WITH_ERRORS,
          label: 'Completed with errors',
          position: 3,
          color: 'orange',
        },
        {
          id: MIGRATION_ITEM_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.failed,
          value: MIGRATION_ITEM_STATUS.FAILED,
          label: 'Failed',
          position: 4,
          color: 'red',
        },
        {
          id: MIGRATION_ITEM_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.skipped,
          value: MIGRATION_ITEM_STATUS.SKIPPED,
          label: 'Skipped',
          position: 5,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.salesforceObject,
      type: FieldType.TEXT,
      name: 'salesforceObject',
      label: 'Salesforce object',
      icon: 'IconCloud',
    },
    {
      universalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.targetObject,
      type: FieldType.TEXT,
      name: 'targetObject',
      label: 'Twenty object',
      icon: 'IconTarget',
    },
    {
      universalIdentifier: MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.position,
      type: FieldType.NUMBER,
      name: 'processingOrder',
      label: 'Processing order',
      description:
        'Items are processed in this order so that relation targets exist before the records that reference them.',
      icon: 'IconSortAscending',
    },
    {
      universalIdentifier: MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.recordCount,
      type: FieldType.NUMBER,
      name: 'recordCount',
      label: 'Record count',
      icon: 'IconSum',
    },
    {
      universalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.processedCount,
      type: FieldType.NUMBER,
      name: 'processedCount',
      label: 'Processed',
      icon: 'IconChecklist',
    },
    {
      universalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.createdCount,
      type: FieldType.NUMBER,
      name: 'createdCount',
      label: 'Created',
      icon: 'IconPlus',
    },
    {
      universalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.updatedCount,
      type: FieldType.NUMBER,
      name: 'updatedCount',
      label: 'Updated',
      icon: 'IconRefresh',
    },
    {
      universalIdentifier: MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.failedCount,
      type: FieldType.NUMBER,
      name: 'failedCount',
      label: 'Failed',
      icon: 'IconAlertTriangle',
    },
    {
      universalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.lastProcessedId,
      type: FieldType.TEXT,
      name: 'lastProcessedId',
      label: 'Last processed Id',
      description:
        'Salesforce Id watermark: batches resume after this Id, making processing idempotent and resumable.',
      icon: 'IconBookmark',
    },
    {
      universalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.batchRetryCount,
      type: FieldType.NUMBER,
      name: 'batchRetryCount',
      label: 'Batch retry count',
      description:
        'Consecutive failed attempts on the current batch. The item fails after too many retries instead of looping forever.',
      icon: 'IconRotateClockwise',
    },
    {
      universalIdentifier:
        MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.fieldMapping,
      type: FieldType.RAW_JSON,
      name: 'fieldMapping',
      label: 'Field mapping',
      description: 'Salesforce field to Twenty field mapping applied to this object.',
      icon: 'IconArrowsLeftRight',
    },
    {
      universalIdentifier: MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS.lastError,
      type: FieldType.TEXT,
      name: 'lastError',
      label: 'Last error',
      icon: 'IconExclamationCircle',
    },
  ],
});
