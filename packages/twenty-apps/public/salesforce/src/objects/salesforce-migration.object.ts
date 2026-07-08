import { defineObject, FieldType } from 'twenty-sdk/define';

import { MIGRATION_STATUS } from 'src/constants/migration-status';
import {
  MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS,
  MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'salesforceMigration',
  namePlural: 'salesforceMigrations',
  labelSingular: 'Salesforce Migration',
  labelPlural: 'Salesforce Migrations',
  description:
    'A Salesforce to Twenty migration run: its plan, live progress, and outcome.',
  icon: 'IconCloudDownload',
  labelIdentifierFieldMetadataUniversalIdentifier:
    MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.name,
  fields: [
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.name,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.status,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      isNullable: false,
      defaultValue: `'${MIGRATION_STATUS.READY}'`,
      options: [
        {
          id: MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.ready,
          value: MIGRATION_STATUS.READY,
          label: 'Ready',
          position: 0,
          color: 'blue',
        },
        {
          id: MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.running,
          value: MIGRATION_STATUS.RUNNING,
          label: 'Running',
          position: 1,
          color: 'turquoise',
        },
        {
          id: MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.paused,
          value: MIGRATION_STATUS.PAUSED,
          label: 'Paused',
          position: 2,
          color: 'yellow',
        },
        {
          id: MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.completed,
          value: MIGRATION_STATUS.COMPLETED,
          label: 'Completed',
          position: 3,
          color: 'green',
        },
        {
          id: MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.completedWithErrors,
          value: MIGRATION_STATUS.COMPLETED_WITH_ERRORS,
          label: 'Completed with errors',
          position: 4,
          color: 'orange',
        },
        {
          id: MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.failed,
          value: MIGRATION_STATUS.FAILED,
          label: 'Failed',
          position: 5,
          color: 'red',
        },
        {
          id: MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.cancelled,
          value: MIGRATION_STATUS.CANCELLED,
          label: 'Cancelled',
          position: 6,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.plan,
      type: FieldType.RAW_JSON,
      name: 'plan',
      label: 'Plan',
      description:
        'The full migration plan: objects, record counts, field mappings, relations, and warnings.',
      icon: 'IconListDetails',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.totalRecords,
      type: FieldType.NUMBER,
      name: 'totalRecords',
      label: 'Total records',
      icon: 'IconSum',
    },
    {
      universalIdentifier:
        MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.processedRecords,
      type: FieldType.NUMBER,
      name: 'processedRecords',
      label: 'Processed records',
      icon: 'IconChecklist',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.createdRecords,
      type: FieldType.NUMBER,
      name: 'createdRecords',
      label: 'Created records',
      icon: 'IconPlus',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.updatedRecords,
      type: FieldType.NUMBER,
      name: 'updatedRecords',
      label: 'Updated records',
      icon: 'IconRefresh',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.failedRecords,
      type: FieldType.NUMBER,
      name: 'failedRecords',
      label: 'Failed records',
      icon: 'IconAlertTriangle',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.startedAt,
      type: FieldType.DATE_TIME,
      name: 'startedAt',
      label: 'Started at',
      icon: 'IconPlayerPlay',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.completedAt,
      type: FieldType.DATE_TIME,
      name: 'completedAt',
      label: 'Completed at',
      icon: 'IconFlagCheck',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.heartbeatAt,
      type: FieldType.DATE_TIME,
      name: 'heartbeatAt',
      label: 'Heartbeat at',
      description:
        'Last time the background worker made progress on this migration. Used to avoid concurrent processing.',
      icon: 'IconHeartRateMonitor',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.lastError,
      type: FieldType.TEXT,
      name: 'lastError',
      label: 'Last error',
      icon: 'IconExclamationCircle',
    },
    {
      universalIdentifier: MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS.salesforceOrgId,
      type: FieldType.TEXT,
      name: 'salesforceOrgId',
      label: 'Salesforce Org Id',
      description: 'The Salesforce organization this migration was planned against.',
      icon: 'IconCloud',
    },
  ],
});
