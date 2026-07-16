import { defineObject, FieldType } from 'twenty-sdk/define';

export const EXTERNAL_SYNC_RECONCILIATION_RUN_UNIVERSAL_IDENTIFIER =
  '8a9b0c1d-2e3f-4a4b-8c6d-7e8f9a0b1c2d';

export const RECON_SCOPE_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c11';
export const RECON_STATUS_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c12';
export const RECON_STARTED_AT_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c13';
export const RECON_FINISHED_AT_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c14';
export const RECON_SUMMARY_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c15';

export default defineObject({
  universalIdentifier: EXTERNAL_SYNC_RECONCILIATION_RUN_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalSyncReconciliationRun',
  namePlural: 'externalSyncReconciliationRuns',
  labelSingular: 'External Sync Reconciliation Run',
  labelPlural: 'External Sync Reconciliation Runs',
  description: 'A reconciliation run comparing Directus and Twenty records',
  icon: 'IconRefresh',
  labelIdentifierFieldMetadataUniversalIdentifier: RECON_SCOPE_UID,
  fields: [
    {
      universalIdentifier: RECON_SCOPE_UID,
      type: FieldType.TEXT,
      label: 'Scope',
      description: 'Scope of the reconciliation (e.g. all, collection:xyz)',
      icon: 'IconSearch',
      name: 'scope',
    },
    {
      universalIdentifier: RECON_STATUS_UID,
      type: FieldType.TEXT,
      label: 'Status',
      description: 'Status of the reconciliation run',
      icon: 'IconStatusChange',
      name: 'status',
    },
    {
      universalIdentifier: RECON_STARTED_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Started At',
      description: 'When the reconciliation run started',
      icon: 'IconClock',
      name: 'startedAt',
    },
    {
      universalIdentifier: RECON_FINISHED_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Finished At',
      description: 'When the reconciliation run finished',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
      name: 'finishedAt',
    },
    {
      universalIdentifier: RECON_SUMMARY_UID,
      type: FieldType.RAW_JSON,
      label: 'Summary',
      description: 'JSON summary of findings and statistics',
      icon: 'IconReport',
      isNullable: true,
      defaultValue: null,
      name: 'summary',
    },
  ],
});
