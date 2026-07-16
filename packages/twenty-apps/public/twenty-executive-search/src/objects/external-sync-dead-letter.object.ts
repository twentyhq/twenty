import { defineObject, FieldType } from 'twenty-sdk/define';

export const EXTERNAL_SYNC_DEAD_LETTER_UNIVERSAL_IDENTIFIER =
  'b0c1d2e3-4f5a-4b6c-8d8e-9f0a1b2c3d4e';

export const DL_ORIGINAL_EVENT_ID_UID =
  'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f01';
export const DL_DIRECTION_UID =
  'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f02';
export const DL_PAYLOAD_UID =
  'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f03';
export const DL_ERROR_CODE_UID =
  'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f04';
export const DL_ERROR_DETAIL_UID =
  'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f05';
export const DL_DEAD_AT_UID =
  'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f06';
export const DL_REPLAYABLE_AT_UID =
  'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f07';
export const DL_REPLAYED_AT_UID =
  'd1e2f3a4-5b6c-4d7e-8f9a-0b1c2d3e4f08';

export default defineObject({
  universalIdentifier: EXTERNAL_SYNC_DEAD_LETTER_UNIVERSAL_IDENTIFIER,
  nameSingular: 'externalSyncDeadLetter',
  namePlural: 'externalSyncDeadLetters',
  labelSingular: 'External Sync Dead Letter',
  labelPlural: 'External Sync Dead Letters',
  description: 'Dead-letter queue for permanently failed sync events',
  icon: 'IconSkull',
  labelIdentifierFieldMetadataUniversalIdentifier: DL_ORIGINAL_EVENT_ID_UID,
  fields: [
    {
      universalIdentifier: DL_ORIGINAL_EVENT_ID_UID,
      type: FieldType.TEXT,
      label: 'Original Event ID',
      description: 'ID of the original event that failed',
      icon: 'IconHash',
      name: 'originalEventId',
    },
    {
      universalIdentifier: DL_DIRECTION_UID,
      type: FieldType.SELECT,
      label: 'Direction',
      description: 'Whether the original event was inbound or outbound',
      icon: 'IconArrowSplit',
      options: [
        {
          id: 'a1b2c3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
          value: 'INBOUND',
          label: 'Inbound',
          position: 0,
          color: 'blue',
        },
        {
          id: 'b2c3d4e5-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
          value: 'OUTBOUND',
          label: 'Outbound',
          position: 1,
          color: 'orange',
        },
      ],
      name: 'direction',
    },
    {
      universalIdentifier: DL_PAYLOAD_UID,
      type: FieldType.RAW_JSON,
      label: 'Payload',
      description: 'Original event payload',
      icon: 'IconCode',
      name: 'payload',
    },
    {
      universalIdentifier: DL_ERROR_CODE_UID,
      type: FieldType.TEXT,
      label: 'Error Code',
      description: 'Error code from the failure',
      icon: 'IconX',
      name: 'errorCode',
    },
    {
      universalIdentifier: DL_ERROR_DETAIL_UID,
      type: FieldType.TEXT,
      label: 'Error Detail',
      description: 'Detailed error message',
      icon: 'IconAlertTriangle',
      isNullable: true,
      defaultValue: null,
      name: 'errorDetail',
    },
    {
      universalIdentifier: DL_DEAD_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Dead At',
      description: 'When the event was moved to dead-letter',
      icon: 'IconClock',
      name: 'deadAt',
    },
    {
      universalIdentifier: DL_REPLAYABLE_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Replayable At',
      description: 'Earliest time this event may be replayed',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
      name: 'replayableAt',
    },
    {
      universalIdentifier: DL_REPLAYED_AT_UID,
      type: FieldType.DATE_TIME,
      label: 'Replayed At',
      description: 'When this event was last replayed',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
      name: 'replayedAt',
    },
  ],
});
