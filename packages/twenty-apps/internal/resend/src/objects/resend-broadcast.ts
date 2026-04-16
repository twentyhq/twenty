import { defineObject, FieldType } from 'twenty-sdk';

export const RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER =
  'bebc114f-a8f5-455d-8c6f-e33f20f66967';

export const BROADCAST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'e3222f79-751d-4c9e-b33d-c5f2e6ee8304';

export const BROADCAST_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER =
  '51025e6b-375a-45a0-89eb-773314702073';

export const BROADCAST_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER =
  'fa189da3-3443-4984-b637-7fae9b30e2c5';

export const BROADCAST_REPLY_TO_FIELD_UNIVERSAL_IDENTIFIER =
  '8674b4e8-1881-4001-a9df-8e9258b59d50';

export const PREVIEW_TEXT_FIELD_UNIVERSAL_IDENTIFIER =
  'b8a008aa-1a44-4edb-b472-f392af635867';

export const BROADCAST_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '394135a4-6488-4ec3-97bc-d0514921ded8';

export const BROADCAST_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'ee40a63f-6d32-496a-9f4d-1abfba386909';

export const BROADCAST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '01855a84-450b-4de9-b172-e51555724370';

export const BROADCAST_SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'abbb4379-d0a5-432a-8c34-0e940242d687';

export const BROADCAST_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'e1e281aa-7ba7-47a0-951d-0f6150a63099';

export default defineObject({
  universalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'resendBroadcast',
  namePlural: 'resendBroadcasts',
  labelSingular: 'Resend broadcast',
  labelPlural: 'Resend broadcasts',
  description: 'A broadcast email campaign from Resend',
  icon: 'IconSpeakerphone',
  labelIdentifierFieldMetadataUniversalIdentifier:
    BROADCAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: BROADCAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the broadcast',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: BROADCAST_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'subject',
      label: 'Subject',
      description: 'Email subject line',
      icon: 'IconMail',
    },
    {
      universalIdentifier: BROADCAST_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'fromAddress',
      label: 'From',
      description: 'Sender email address',
      icon: 'IconMailForward',
    },
    {
      universalIdentifier: BROADCAST_REPLY_TO_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'replyTo',
      label: 'Reply to',
      description: 'Reply-to email address',
      icon: 'IconMailReply',
    },
    {
      universalIdentifier: PREVIEW_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'previewText',
      label: 'Preview text',
      description: 'Preview text shown in email clients',
      icon: 'IconEye',
    },
    {
      universalIdentifier: BROADCAST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Current broadcast status',
      icon: 'IconStatusChange',
      options: [
        {
          id: 'c090f598-1e30-4cc2-9686-7413b926760e',
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: 'd8428e6a-8a2b-4307-89d8-f8095f8f425c',
          value: 'QUEUED',
          label: 'Queued',
          position: 1,
          color: 'blue',
        },
        {
          id: '13c38a05-511b-4bf3-86c1-824d084107c8',
          value: 'SENDING',
          label: 'Sending',
          position: 2,
          color: 'yellow',
        },
        {
          id: '79150897-a5c0-4695-9a59-cd40db44b066',
          value: 'SENT',
          label: 'Sent',
          position: 3,
          color: 'green',
        },
      ],
    },
    {
      universalIdentifier: BROADCAST_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'resendId',
      label: 'Resend ID',
      description: 'Resend broadcast identifier',
      icon: 'IconHash',
    },
    {
      universalIdentifier: BROADCAST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'createdAt',
      label: 'Created at',
      description: 'When the broadcast was created',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: BROADCAST_SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'scheduledAt',
      label: 'Scheduled at',
      description: 'When the broadcast is scheduled to be sent',
      icon: 'IconCalendarEvent',
    },
    {
      universalIdentifier: BROADCAST_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'sentAt',
      label: 'Sent at',
      description: 'When the broadcast was sent',
      icon: 'IconSend',
    },
  ],
});
