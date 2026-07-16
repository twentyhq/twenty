import { defineObject, FieldType } from 'twenty-sdk/define';

import { EXTERNAL_SYNC_RECONCILIATION_RUN_UNIVERSAL_IDENTIFIER } from './external-sync-reconciliation-run.object';

export const EXTERNAL_SYNC_RECONCILIATION_FINDING_UNIVERSAL_IDENTIFIER =
  '7a8b9c0d-1e2f-4a3b-8c5d-6e7f8a9b0c1d';

export const FINDING_RUN_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d21';
export const FINDING_KIND_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d22';
export const FINDING_RECORD_REF_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d23';
export const FINDING_SEVERITY_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d24';
export const FINDING_DETAIL_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d25';

export default defineObject({
  universalIdentifier: EXTERNAL_SYNC_RECONCILIATION_FINDING_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalSyncReconciliationFinding',
  namePlural: 'externalSyncReconciliationFindings',
  labelSingular: 'External Sync Reconciliation Finding',
  labelPlural: 'External Sync Reconciliation Findings',
  description: 'A single finding from a reconciliation run',
  icon: 'IconSearch',
  labelIdentifierFieldMetadataUniversalIdentifier: FINDING_RECORD_REF_UID,
  fields: [
    {
      universalIdentifier: FINDING_RUN_UID,
      type: FieldType.RELATION,
      label: 'Run',
      description: 'The reconciliation run this finding belongs to',
      icon: 'IconRefresh',
      name: 'run',
      relationTargetObjectMetadataUniversalIdentifier:
        EXTERNAL_SYNC_RECONCILIATION_RUN_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier: '',
      universalSettings: {},
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: FINDING_KIND_UID,
      type: FieldType.SELECT,
      label: 'Kind',
      description: 'Category of the finding',
      icon: 'IconCategory',
      options: [
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d31',
          value: 'existence',
          label: 'Existence',
          position: 0,
          color: 'red',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d32',
          value: 'field-hash',
          label: 'Field Hash',
          position: 1,
          color: 'orange',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d33',
          value: 'candidate-visible',
          label: 'Candidate Visible',
          position: 2,
          color: 'yellow',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d34',
          value: 'published',
          label: 'Published',
          position: 3,
          color: 'blue',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d35',
          value: 'interview',
          label: 'Interview',
          position: 4,
          color: 'purple',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d36',
          value: 'reference',
          label: 'Reference',
          position: 5,
          color: 'pink',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d37',
          value: 'consent',
          label: 'Consent',
          position: 6,
          color: 'teal',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d38',
          value: 'ai',
          label: 'AI',
          position: 7,
          color: 'cyan',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d39',
          value: 'file',
          label: 'File',
          position: 8,
          color: 'indigo',
        },
        {
          id: 'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d40',
          value: 'retention',
          label: 'Retention',
          position: 9,
          color: 'gray',
        },
      ],
      name: 'kind',
    },
    {
      universalIdentifier: FINDING_RECORD_REF_UID,
      type: FieldType.TEXT,
      label: 'Record Ref',
      description: 'Reference to the affected record',
      icon: 'IconLink',
      name: 'recordRef',
    },
    {
      universalIdentifier: FINDING_SEVERITY_UID,
      type: FieldType.TEXT,
      label: 'Severity',
      description: 'Severity level of the finding',
      icon: 'IconAlertCircle',
      name: 'severity',
    },
    {
      universalIdentifier: FINDING_DETAIL_UID,
      type: FieldType.TEXT,
      label: 'Detail',
      description: 'Detailed description of the finding',
      icon: 'IconFileDescription',
      name: 'detail',
    },
  ],
});
