import { defineObject, FieldType } from 'twenty-sdk/define';

export const EXTERNAL_SYNC_CONFLICT_UNIVERSAL_IDENTIFIER =
  'a0b1c2d3-4e5f-4a6b-8c8d-9e0f1a2b3c4d';

export const CONFLICT_RECORD_REF_UID =
  'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a01';
export const CONFLICT_FIELD_UID =
  'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a02';
export const CONFLICT_AUTHORITATIVE_VALUE_UID =
  'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a03';
export const CONFLICT_STATUS_UID =
  'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a04';
export const CONFLICT_RESOLVED_BY_UID =
  'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a05';
export const CONFLICT_RESOLVED_AT_UID =
  'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a06';

export default defineObject({
  universalIdentifier: EXTERNAL_SYNC_CONFLICT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalSyncConflict',
  namePlural: 'externalSyncConflicts',
  labelSingular: 'External Sync Conflict',
  labelPlural: 'External Sync Conflicts',
  description: 'Record of field-level sync conflicts between systems',
  icon: 'IconAlertTriangle',
  labelIdentifierFieldMetadataUniversalIdentifier: CONFLICT_RECORD_REF_UID,
  fields: [
    {
      universalIdentifier: CONFLICT_RECORD_REF_UID,
      type: FieldType.TEXT,
      label: 'Record Ref',
      description: 'Reference to the conflicting record',
      icon: 'IconLink',
      name: 'recordRef',
    },
    {
      universalIdentifier: CONFLICT_FIELD_UID,
      type: FieldType.TEXT,
      label: 'Field',
      description: 'Name of the field with a conflict',
      icon: 'IconField',
      name: 'field',
    },
    {
      universalIdentifier: CONFLICT_AUTHORITATIVE_VALUE_UID,
      type: FieldType.RAW_JSON,
      label: 'Authoritative Value',
      description: 'The value chosen as authoritative',
      icon: 'IconCheck',
      name: 'authoritativeValue',
    },
    {
      universalIdentifier: CONFLICT_STATUS_UID,
      type: FieldType.SELECT,
      label: 'Status',
      description: 'Resolution status of the conflict',
      icon: 'IconStatusChange',
      defaultValue: "'OPEN'",
      options: [
        {
          id: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
          value: 'OPEN',
          label: 'Open',
          position: 0,
          color: 'red',
        },
        {
          id: 'b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
          value: 'RESOLVED',
          label: 'Resolved',
          position: 1,
          color: 'green',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier: CONFLICT_RESOLVED_BY_UID,
      type: FieldType.TEXT,
      label: 'Resolved By',
      description: 'Who or what resolved the conflict',
      icon: 'IconUser',
      isNullable: true,
      defaultValue: null,
      name: 'resolvedBy',
    },
    {
      universalIdentifier: CONFLICT_RESOLVED_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Resolved At',
      description: 'When the conflict was resolved',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
      name: 'resolvedAt',
    },
  ],
});
