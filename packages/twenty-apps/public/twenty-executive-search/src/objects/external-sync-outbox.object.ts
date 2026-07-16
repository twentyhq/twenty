import { defineObject, FieldType } from 'twenty-sdk/define';

export const EXTERNAL_SYNC_OUTBOX_UNIVERSAL_IDENTIFIER =
  'e6a7b8c9-0d1e-4f2a-8b4c-5d6e7f8a9b0c';

export const EVENT_ID_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c01';
export const IDEMPOTENCY_KEY_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c02';
export const SOURCE_SYSTEM_OUTBOX_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c03';
export const OUTBOX_EVENT_TYPE_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c04';
export const OUTBOX_PAYLOAD_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c05';
export const OUTBOX_STATUS_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c06';
export const ATTEMPT_COUNT_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c07';
export const NEXT_ATTEMPT_AT_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c08';
export const LAST_ERROR_UID =
  'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c09';

export default defineObject({
  universalIdentifier: EXTERNAL_SYNC_OUTBOX_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalSyncOutbox',
  namePlural: 'externalSyncOutboxes',
  labelSingular: 'External Sync Outbox',
  labelPlural: 'External Sync Outboxes',
  description: 'Transactional outbox for sync events pending delivery',
  icon: 'IconSend',
  labelIdentifierFieldMetadataUniversalIdentifier: EVENT_ID_UID,
  fields: [
    {
      universalIdentifier: EVENT_ID_UID,
      type: FieldType.TEXT,
      label: 'Event ID',
      description: 'Unique identifier for the outbox event',
      icon: 'IconHash',
      name: 'eventId',
      isUnique: false,
    },
    {
      universalIdentifier: IDEMPOTENCY_KEY_UID,
      type: FieldType.TEXT,
      label: 'Idempotency Key',
      description: 'Key for idempotent outbox writes within a workspace',
      icon: 'IconKey',
      name: 'idempotencyKey',
    },
    {
      universalIdentifier: SOURCE_SYSTEM_OUTBOX_UID,
      type: FieldType.SELECT,
      label: 'Source System',
      description: 'System that originated the event',
      icon: 'IconServer',
      options: [
        {
          id: 'a1b2c3d4-5e6f-4a7b-8c9d-9f8e7d6c5b4a',
          value: 'DIRECTUS',
          label: 'Directus',
          position: 0,
          color: 'blue',
        },
        {
          id: 'b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
          value: 'TWENTY',
          label: 'Twenty',
          position: 1,
          color: 'green',
        },
      ],
      name: 'sourceSystem',
    },
    {
      universalIdentifier: OUTBOX_EVENT_TYPE_UID,
      type: FieldType.TEXT,
      label: 'Event Type',
      description: 'Type/category of the event',
      icon: 'IconTag',
      name: 'eventType',
    },
    {
      universalIdentifier: OUTBOX_PAYLOAD_UID,
      type: FieldType.RAW_JSON,
      label: 'Payload',
      description: 'JSON serialized event payload',
      icon: 'IconCode',
      name: 'payload',
    },
    {
      universalIdentifier: OUTBOX_STATUS_UID,
      type: FieldType.SELECT,
      label: 'Status',
      description: 'Delivery status of the outbox row',
      icon: 'IconStatusChange',
      defaultValue: "'PENDING'",
      options: [
        {
          id: 'c3d4e5f6-7a8b-4c9d-0e1f-2a3b4c5d6e7f',
          value: 'PENDING',
          label: 'Pending',
          position: 0,
          color: 'yellow',
        },
        {
          id: 'd4e5f6a7-8b9c-4d0e-1f2a-3b4c5d6e7f8a',
          value: 'SENT',
          label: 'Sent',
          position: 1,
          color: 'green',
        },
        {
          id: 'e5f6a7b8-9c0d-4e1f-2a3b-4c5d6e7f8a9b',
          value: 'DEAD',
          label: 'Dead',
          position: 2,
          color: 'red',
        },
      ],
      name: 'status',
    },
    {
      universalIdentifier: ATTEMPT_COUNT_UID,
      type: FieldType.NUMBER,
      label: 'Attempt Count',
      description: 'Number of delivery attempts',
      icon: 'IconRepeat',
      defaultValue: 0,
      name: 'attemptCount',
    },
    {
      universalIdentifier: NEXT_ATTEMPT_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Next Attempt At',
      description: 'Scheduled time for next delivery attempt',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
      name: 'nextAttemptAt',
    },
    {
      universalIdentifier: LAST_ERROR_UID,
      type: FieldType.TEXT,
      label: 'Last Error',
      description: 'Error message from the last failed attempt',
      icon: 'IconAlertCircle',
      isNullable: true,
      defaultValue: null,
      name: 'lastError',
    },
  ],
  indexes: [
    {
      universalIdentifier: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c10',
      objectUniversalIdentifier: EXTERNAL_SYNC_OUTBOX_UNIVERSAL_IDENTIFIER,
      name: 'idx_externalSyncOutbox_workspace_idempotency',
      isUnique: true,
      fieldMetadataUniversalIdentifiers: [
        IDEMPOTENCY_KEY_UID,
      ],
    },
  ],
});
