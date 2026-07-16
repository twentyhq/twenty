import { defineObject, FieldType } from 'twenty-sdk/define';

export const EXTERNAL_SYNC_OUTBOUND_EVENT_UNIVERSAL_IDENTIFIER =
  'd0e1f2a3-4b5c-4d6e-8f8a-9b0c1d2e3f4a';

export const OUTBOUND_EVENT_ID_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e01';
export const OUTBOUND_IDEMPOTENCY_KEY_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e02';
export const OUTBOUND_TARGET_COLLECTION_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e03';
export const OUTBOUND_PAYLOAD_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e04';
export const OUTBOUND_BEFORE_HASH_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e05';
export const OUTBOUND_AFTER_HASH_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e06';
export const OUTBOUND_STATUS_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e07';
export const OUTBOUND_SIGNED_AT_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e08';
export const OUTBOUND_SENT_AT_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e09';
export const OUTBOUND_LAST_ERROR_UID =
  'c2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e10';

export default defineObject({
  universalIdentifier: EXTERNAL_SYNC_OUTBOUND_EVENT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalSyncOutboundEvent',
  namePlural: 'externalSyncOutboundEvents',
  labelSingular: 'External Sync Outbound Event',
  labelPlural: 'External Sync Outbound Events',
  description: 'Outbound sync event projection ledger',
  icon: 'IconArrowUpCircle',
  labelIdentifierFieldMetadataUniversalIdentifier: OUTBOUND_EVENT_ID_UID,
  fields: [
    {
      universalIdentifier: OUTBOUND_EVENT_ID_UID,
      type: FieldType.TEXT,
      label: 'Event ID',
      description: 'Unique identifier for the outbound event',
      icon: 'IconHash',
      name: 'eventId',
      isUnique: true,
    },
    {
      universalIdentifier: OUTBOUND_IDEMPOTENCY_KEY_UID,
      type: FieldType.TEXT,
      label: 'Idempotency Key',
      description: 'Key for idempotent outbound writes within a workspace',
      icon: 'IconKey',
      name: 'idempotencyKey',
    },
    {
      universalIdentifier: OUTBOUND_TARGET_COLLECTION_UID,
      type: FieldType.TEXT,
      label: 'Target Collection',
      description: 'Target Directus collection name',
      icon: 'IconDatabase',
      name: 'targetCollection',
    },
    {
      universalIdentifier: OUTBOUND_PAYLOAD_UID,
      type: FieldType.RAW_JSON,
      label: 'Payload',
      description: 'JSON serialized outbound payload',
      icon: 'IconCode',
      name: 'payload',
    },
    {
      universalIdentifier: OUTBOUND_BEFORE_HASH_UID,
      type: FieldType.TEXT,
      label: 'Before Hash',
      description: 'Hash of the record state before change',
      icon: 'IconHash',
      isNullable: true,
      defaultValue: null,
      name: 'beforeHash',
    },
    {
      universalIdentifier: OUTBOUND_AFTER_HASH_UID,
      type: FieldType.TEXT,
      label: 'After Hash',
      description: 'Hash of the record state after change',
      icon: 'IconHash',
      isNullable: true,
      defaultValue: null,
      name: 'afterHash',
    },
    {
      universalIdentifier: OUTBOUND_STATUS_UID,
      type: FieldType.SELECT,
      label: 'Status',
      description: 'Signing and delivery status',
      icon: 'IconStatusChange',
      defaultValue: "'PENDING'",
      options: [
        {
          id: 'c1d2e3f4-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
          value: 'PENDING',
          label: 'Pending',
          position: 0,
          color: 'yellow',
        },
        {
          id: 'd2e3f4a5-6b7c-4d8e-9f0a-1b2c3d4e5f6a',
          value: 'SIGNED',
          label: 'Signed',
          position: 1,
          color: 'blue',
        },
        {
          id: 'e3f4a5b6-7c8d-4e9f-0a1b-2c3d4e5f6a7b',
          value: 'SENT',
          label: 'Sent',
          position: 2,
          color: 'green',
        },
        {
          id: 'f4a5b6c7-8d9e-4f0a-1b2c-3d4e5f6a7b8c',
          value: 'DEAD',
          label: 'Dead',
          position: 3,
          color: 'red',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier: OUTBOUND_SIGNED_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Signed At',
      description: 'Timestamp when the payload was signed',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
      name: 'signedAt',
    },
    {
      universalIdentifier: OUTBOUND_SENT_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Sent At',
      description: 'Timestamp when the payload was sent',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
      name: 'sentAt',
    },
    {
      universalIdentifier: OUTBOUND_LAST_ERROR_UID,
      type: FieldType.TEXT,
      label: 'Last Error',
      description: 'Error message from last failed send',
      icon: 'IconAlertCircle',
      isNullable: true,
      defaultValue: null,
      name: 'lastError',
    },
  ],
});
