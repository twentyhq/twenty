import { defineObject, FieldType } from 'twenty-sdk/define';

enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
  CONFLICT = 'CONFLICT',
}

enum ConflictStatus {
  NONE = 'NONE',
  SOURCE_WINS = 'SOURCE_WINS',
  TARGET_WINS = 'TARGET_WINS',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

export const EXTERNAL_ENTITY_LINK_UNIVERSAL_IDENTIFIER =
  'fc3c2d84-21ad-476c-8671-5db68c3f0b20';

export const EXTERNAL_ENTITY_LINK_SYNC_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '71325937-d72f-481c-b658-bcb0a97152e9';

export const EXTERNAL_ENTITY_LINK_CONFLICT_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '2ebf2aab-8bdc-4b56-9097-ce08d59bec79';

export default defineObject({
  universalIdentifier: EXTERNAL_ENTITY_LINK_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalEntityLink',
  namePlural: 'externalEntityLinks',
  labelSingular: 'External Entity Link',
  labelPlural: 'External Entity Links',
  description:
    'Durable ledger record linking a Twenty record to an external system record (e.g. Directus), with sync state, conflict resolution, and error tracking.',
  icon: 'IconPlugConnected',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'f1bed0ae-b399-4e18-97b0-39d69d528097',
  fields: [
    {
      universalIdentifier: 'f1bed0ae-b399-4e18-97b0-39d69d528097',
      type: FieldType.TEXT,
      label: 'System',
      description:
        'External system identifier (e.g. DIRECTUS).',
      icon: 'IconServers',
      name: 'system',
    },
    {
      universalIdentifier: '53082e86-0c89-4800-82bb-9aa20b0e5a1e',
      type: FieldType.TEXT,
      label: 'External Collection',
      description: 'Collection or table name in the external system.',
      icon: 'IconDatabase',
      name: 'externalCollection',
    },
    {
      universalIdentifier: '638bc038-6238-4496-ae64-b0e86a86b2a2',
      type: FieldType.TEXT,
      label: 'External ID',
      description: 'Record ID in the external system.',
      icon: 'IconId',
      name: 'externalId',
    },
    {
      universalIdentifier: '7fa228b9-f9c8-482b-8ffb-60bd86b2b0b9',
      type: FieldType.TEXT,
      label: 'Twenty Object UID',
      description:
        'Universal identifier of the Twenty object metadata.',
      icon: 'IconBox',
      name: 'twentyObjectUniversalIdentifier',
    },
    {
      universalIdentifier: '346651ce-9e69-4ff8-ad6d-db0127e3927e',
      type: FieldType.UUID,
      label: 'Twenty Record ID',
      description: 'UUID of the record in Twenty.',
      icon: 'IconFingerprint',
      name: 'twentyRecordId',
    },
    {
      universalIdentifier: 'ace3d520-9f01-4075-9808-b3ecc9bc25b5',
      type: FieldType.TEXT,
      label: 'External Natural Key',
      description:
        'Natural business key from the source system (e.g. email, domain).',
      icon: 'IconKey',
      name: 'externalNaturalKey',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'a3cea80a-527f-4cd7-8b8e-8591b86f0f8c',
      type: FieldType.TEXT,
      label: 'Source Version',
      description: 'Version identifier from the source system.',
      icon: 'IconVersions',
      name: 'sourceVersion',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '25bc091c-0f43-4a65-a73b-c0d0d48be086',
      type: FieldType.DATE_TIME,
      label: 'Source Updated At',
      description: 'Timestamp of last update in the source system.',
      icon: 'IconClock',
      name: 'sourceUpdatedAt',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '69e156cd-9d5f-46a9-afa0-72329188685b',
      type: FieldType.TEXT,
      label: 'Source Hash',
      description: 'Content hash from the source system.',
      icon: 'IconHash',
      name: 'sourceHash',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'ac170f01-5bde-4084-9f42-ddcf11e81d05',
      type: FieldType.DATE_TIME,
      label: 'Last Inbound Sync At',
      description: 'Timestamp of last successful inbound sync.',
      icon: 'IconArrowDownCircle',
      name: 'lastInboundSyncAt',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'a9ad9e47-5956-4e74-86a4-4feba1dc4d66',
      type: FieldType.DATE_TIME,
      label: 'Last Outbound Sync At',
      description: 'Timestamp of last successful outbound sync.',
      icon: 'IconArrowUpCircle',
      name: 'lastOutboundSyncAt',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXTERNAL_ENTITY_LINK_SYNC_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Sync Status',
      description: 'Current state of synchronization.',
      icon: 'IconRefresh',
      options: [
        {
          id: '02aeb2c9-c60f-4fb3-9d4a-1f3609a48623',
          value: SyncStatus.PENDING,
          label: 'Pending',
          position: 0,
          color: 'yellow',
        },
        {
          id: 'f12d6d6c-e383-4e86-8005-1d4f4d15361a',
          value: SyncStatus.SYNCED,
          label: 'Synced',
          position: 1,
          color: 'green',
        },
        {
          id: '883accf0-ee9b-4a11-9bab-0eceff072e9f',
          value: SyncStatus.FAILED,
          label: 'Failed',
          position: 2,
          color: 'red',
        },
        {
          id: '78f8e35b-85b3-4b7f-b3b6-9d377ad2e9ab',
          value: SyncStatus.CONFLICT,
          label: 'Conflict',
          position: 3,
          color: 'orange',
        },
      ],
      name: 'syncStatus',
      defaultValue: `'${SyncStatus.PENDING}'`,
    },
    {
      universalIdentifier:
        EXTERNAL_ENTITY_LINK_CONFLICT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Conflict Status',
      description: 'Resolution state when a sync conflict exists.',
      icon: 'IconAlertTriangle',
      options: [
        {
          id: 'bc4ce40a-cc41-49e2-8809-42131a4b5ccb',
          value: ConflictStatus.NONE,
          label: 'None',
          position: 0,
          color: 'green',
        },
        {
          id: '2e282ec4-6feb-48e7-baee-ba86e4a5e9ac',
          value: ConflictStatus.SOURCE_WINS,
          label: 'Source Wins',
          position: 1,
          color: 'blue',
        },
        {
          id: '8a8b9547-a185-486c-9497-cc3ff74e46d3',
          value: ConflictStatus.TARGET_WINS,
          label: 'Target Wins',
          position: 2,
          color: 'yellow',
        },
        {
          id: 'bacc7c9b-8cd7-45e3-ba6f-9e6d11a7d396',
          value: ConflictStatus.MANUAL_REVIEW,
          label: 'Manual Review',
          position: 3,
          color: 'red',
        },
      ],
      name: 'conflictStatus',
      defaultValue: `'${ConflictStatus.NONE}'`,
    },
    {
      universalIdentifier: 'd161c05c-d49b-40be-be3c-cbfa8b64be7a',
      type: FieldType.TEXT,
      label: 'Last Error Code',
      description: 'Error code from the last failed sync attempt.',
      icon: 'IconX',
      name: 'lastErrorCode',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'e402ac7f-8e72-4614-98e0-854bc3592d78',
      type: FieldType.DATE_TIME,
      label: 'Last Error At',
      description: 'Timestamp of the last error.',
      icon: 'IconClockOff',
      name: 'lastErrorAt',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '18e2ac16-5eb9-4e7d-b253-6f11d7ee6edc',
      type: FieldType.BOOLEAN,
      label: 'Is Authoritative Link',
      description:
        'Whether this is the authoritative link for this Twenty record in this system.',
      icon: 'IconStar',
      name: 'isAuthoritativeLink',
      defaultValue: `'false'`,
    },
    {
      universalIdentifier: 'e5ee5af2-7a25-4cc3-8b1c-546b37e49b9f',
      type: FieldType.RAW_JSON,
      label: 'Metadata',
      description:
        'Additional context or arbitrary metadata as JSON.',
      icon: 'IconJson',
      name: 'metadata',
      isNullable: true,
      defaultValue: null,
    },
  ],
  indexes: [
    {
      universalIdentifier: '16a0bf51-8ef6-49fc-a6d9-c6ee487e8616',
      objectUniversalIdentifier: EXTERNAL_ENTITY_LINK_UNIVERSAL_IDENTIFIER,
      name: 'idx_externalEntityLink_systemExternal',
      isUnique: true,
      fields: [
        {
          universalIdentifier: '5cbf48a0-d236-4bfc-84ba-b4d7990f94a0',
          fieldName: 'system',
        },
        {
          universalIdentifier: '6758a95d-f19e-4bc4-aca6-040e6aa081c6',
          fieldName: 'externalCollection',
        },
        {
          universalIdentifier: '8b39e60c-b19b-40d3-8c29-89e47a0689bd',
          fieldName: 'externalId',
        },
      ],
    },
    {
      universalIdentifier: 'ec134b97-6280-49b7-ab94-9db9907062fd',
      objectUniversalIdentifier: EXTERNAL_ENTITY_LINK_UNIVERSAL_IDENTIFIER,
      name: 'idx_externalEntityLink_systemObject',
      isUnique: true,
      fields: [
        {
          universalIdentifier: '51d8e277-6a39-4cf9-ad83-7b62e9f99485',
          fieldName: 'system',
        },
        {
          universalIdentifier: '847a5f38-a0aa-49a6-8e53-41dbdb660a3f',
          fieldName: 'twentyObjectUniversalIdentifier',
        },
        {
          universalIdentifier: '10f71137-bcfd-40a7-94f1-a3f47a96de0d',
          fieldName: 'twentyRecordId',
        },
      ],
    },
  ],
});
