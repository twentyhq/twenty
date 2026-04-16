import { defineObject, FieldType } from 'twenty-sdk';

export const RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER =
  'f06283b0-c7f9-4267-86de-e489f816cca1';

export const SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '92aad4eb-bfc7-4c3d-aa0a-fad5cf9cbda1';

export const SEGMENT_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '5bce2a58-9eae-4903-b599-3a602e759373';

export const SEGMENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '4757fafa-3032-4f69-ba09-86d968239a8f';

export const SEGMENT_LAST_SYNCED_FROM_RESEND_FIELD_UNIVERSAL_IDENTIFIER =
  '8001f093-09c0-4a22-b7a3-9b1dcee47ce2';

export default defineObject({
  universalIdentifier: RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'resendSegment',
  namePlural: 'resendSegments',
  labelSingular: 'Resend segment',
  labelPlural: 'Resend segments',
  description: 'A contact segment from Resend',
  icon: 'IconUsersGroup',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the segment',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: SEGMENT_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'resendId',
      label: 'Resend ID',
      description: 'Resend segment identifier',
      icon: 'IconHash',
    },
    {
      universalIdentifier: SEGMENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'createdAt',
      label: 'Created at',
      description: 'When the segment was created',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier:
        SEGMENT_LAST_SYNCED_FROM_RESEND_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'lastSyncedFromResend',
      label: 'Last synced from Resend',
      description: 'Timestamp of last inbound sync (used to prevent echo loops)',
      icon: 'IconClock',
    },
  ],
});
