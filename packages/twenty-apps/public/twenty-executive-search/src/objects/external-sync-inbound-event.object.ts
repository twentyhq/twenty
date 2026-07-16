import { defineObject, FieldType } from 'twenty-sdk/define';

export const EXTERNAL_SYNC_INBOUND_EVENT_UNIVERSAL_IDENTIFIER =
  'f0a1b2c3-4d5e-4f6a-8b8c-9d0e1f2a3b4c';

export const INBOUND_EVENT_ID_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d01';
export const INBOUND_IDEMPOTENCY_KEY_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d02';
export const INBOUND_SOURCE_SYSTEM_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d03';
export const INBOUND_SOURCE_COLLECTION_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d04';
export const INBOUND_SOURCE_RECORD_ID_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d05';
export const INBOUND_WORKSPACE_KEY_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d06';
export const INBOUND_RAW_ENVELOPE_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d07';
export const INBOUND_STATUS_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d08';
export const INBOUND_PROCESSED_AT_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d09';
export const INBOUND_LAST_ERROR_UID =
  'b1c2d3e4-5f6a-4b7c-8d9e-0f1a2b3c4d10';

export default defineObject({
  universalIdentifier: EXTERNAL_SYNC_INBOUND_EVENT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalSyncInboundEvent',
  namePlural: 'externalSyncInboundEvents',
  labelSingular: 'External Sync Inbound Event',
  labelPlural: 'External Sync Inbound Events',
  description: 'Inbound sync event receipt ledger',
  icon: 'IconArrowDownCircle',
  labelIdentifierFieldMetadataUniversalIdentifier: INBOUND_EVENT_ID_UID,
  fields: [
    {
      universalIdentifier: INBOUND_EVENT_ID_UID,
      type: FieldType.TEXT,
      label: 'Event ID',
      description: 'Unique identifier from the source system',
      icon: 'IconHash',
      name: 'eventId',
    },
    {
      universalIdentifier: INBOUND_IDEMPOTENCY_KEY_UID,
      type: FieldType.TEXT,
      label: 'Idempotency Key',
      description: 'Key for idempotent receipt within a workspace',
      icon: 'IconKey',
      name: 'idempotencyKey',
    },
    {
      universalIdentifier: INBOUND_SOURCE_SYSTEM_UID,
      type: FieldType.SELECT,
      label: 'Source System',
      description: 'System that originated the event',
      icon: 'IconServer',
      options: [
        {
          id: 'c1d2e3f4-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
          value: 'DIRECTUS',
          label: 'Directus',
          position: 0,
          color: 'blue',
        },
        {
          id: 'd2e3f4a5-6b7c-4d8e-9f0a-1b2c3d4e5f6a',
          value: 'TWENTY',
          label: 'Twenty',
          position: 1,
          color: 'green',
        },
      ],
      name: 'sourceSystem',
    },
    {
      universalIdentifier: INBOUND_SOURCE_COLLECTION_UID,
      type: FieldType.TEXT,
      label: 'Source Collection',
      description: 'Directus collection name',
      icon: 'IconDatabase',
      name: 'sourceCollection',
    },
    {
      universalIdentifier: INBOUND_SOURCE_RECORD_ID_UID,
      type: FieldType.TEXT,
      label: 'Source Record ID',
      description: 'Record ID in the source system',
      icon: 'IconId',
      name: 'sourceRecordId',
    },
    {
      universalIdentifier: INBOUND_WORKSPACE_KEY_UID,
      type: FieldType.TEXT,
      label: 'Workspace Key',
      description: 'Key used to resolve the target workspace',
      icon: 'IconBuilding',
      name: 'workspaceKey',
    },
    {
      universalIdentifier: INBOUND_RAW_ENVELOPE_UID,
      type: FieldType.RAW_JSON,
      label: 'Raw Envelope',
      description: 'Full original webhook payload',
      icon: 'IconCode',
      name: 'rawEnvelope',
    },
    {
      universalIdentifier: INBOUND_STATUS_UID,
      type: FieldType.SELECT,
      label: 'Status',
      description: 'Processing status of the inbound event',
      icon: 'IconStatusChange',
      defaultValue: "'RECEIVED'",
      options: [
        {
          id: 'e1f2a3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b',
          value: 'RECEIVED',
          label: 'Received',
          position: 0,
          color: 'yellow',
        },
        {
          id: 'f2a3b4c5-6d7e-4f8a-9b0c-1d2e3f4a5b6c',
          value: 'PROCESSING',
          label: 'Processing',
          position: 1,
          color: 'blue',
        },
        {
          id: 'a3b4c5d6-7e8f-4a9b-0c1d-2e3f4a5b6c7d',
          value: 'PROCESSED',
          label: 'Processed',
          position: 2,
          color: 'green',
        },
        {
          id: 'b4c5d6e7-8f9a-4b0c-1d2e-3f4a5b6c7d8e',
          value: 'DEAD',
          label: 'Dead',
          position: 3,
          color: 'red',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier: INBOUND_PROCESSED_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Processed At',
      description: 'Timestamp when the event was processed',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
      name: 'processedAt',
    },
    {
      universalIdentifier: INBOUND_LAST_ERROR_UID,
      type: FieldType.TEXT,
      label: 'Last Error',
      description: 'Error message from last processing attempt',
      icon: 'IconAlertCircle',
      isNullable: true,
      defaultValue: null,
      name: 'lastError',
    },
  ],
});
