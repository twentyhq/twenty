import { defineObject, FieldType } from 'twenty-sdk';

export const RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER =
  'd59c00df-9715-46b1-bacd-580681435cef';

export const SUBJECT_FIELD_UNIVERSAL_IDENTIFIER =
  '9e52c08b-d619-445a-b70b-121dc7676ff3';

export const FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER =
  'c663f57e-0fe3-4066-91df-9eb001bab03a';

export const TO_ADDRESSES_FIELD_UNIVERSAL_IDENTIFIER =
  '613e0400-709d-496e-9be4-b6eab8282d2e';

export const HTML_BODY_FIELD_UNIVERSAL_IDENTIFIER =
  'd14c29e4-c971-47d3-a1f1-8f459b8d8719';

export const TEXT_BODY_FIELD_UNIVERSAL_IDENTIFIER =
  '9d6edd43-903b-4e57-8bd0-8bbd9e914c30';

export const CC_ADDRESSES_FIELD_UNIVERSAL_IDENTIFIER =
  'eff53046-039e-444e-9142-33d7cc354ad6';

export const BCC_ADDRESSES_FIELD_UNIVERSAL_IDENTIFIER =
  '3db64fe7-99e9-4d44-81be-e0a55d32b211';

export const REPLY_TO_ADDRESSES_FIELD_UNIVERSAL_IDENTIFIER =
  'acbea701-ca16-4db2-960f-7d8c8493e42d';

export const LAST_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  'c24331f3-43da-4143-9763-53ae01205300';

export const EMAIL_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '374e4e3a-dc13-4159-813e-e5da789a97f0';

export const EMAIL_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '732e6009-67f7-4880-8161-a4310f4df690';

export const SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '3d1b8deb-f102-4c1b-929e-ed7b2647e64b';

export const TAGS_FIELD_UNIVERSAL_IDENTIFIER =
  'd6406a2c-a8b6-416e-b351-e1e5ddb3d5fe';

export default defineObject({
  universalIdentifier: RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'resendEmail',
  namePlural: 'resendEmails',
  labelSingular: 'Resend email',
  labelPlural: 'Resend emails',
  description: 'An email sent via Resend',
  icon: 'IconMail',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'subject',
      label: 'Subject',
      description: 'Email subject line',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'fromAddress',
      label: 'From',
      description: 'Sender email address',
      icon: 'IconMailForward',
    },
    {
      universalIdentifier: TO_ADDRESSES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'toAddresses',
      label: 'To',
      description: 'Recipient email addresses',
      icon: 'IconUsers',
    },
    {
      universalIdentifier: HTML_BODY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'htmlBody',
      label: 'HTML body',
      description: 'HTML content of the email',
      icon: 'IconFileText',
    },
    {
      universalIdentifier: TEXT_BODY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'textBody',
      label: 'Text body',
      description: 'Plain text content of the email',
      icon: 'IconAlignLeft',
    },
    {
      universalIdentifier: CC_ADDRESSES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'ccAddresses',
      label: 'CC',
      description: 'Carbon copy email addresses',
      icon: 'IconCopy',
    },
    {
      universalIdentifier: BCC_ADDRESSES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'bccAddresses',
      label: 'BCC',
      description: 'Blind carbon copy email addresses',
      icon: 'IconEyeOff',
    },
    {
      universalIdentifier: REPLY_TO_ADDRESSES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'replyToAddresses',
      label: 'Reply to',
      description: 'Reply-to email addresses',
      icon: 'IconMailReply',
    },
    {
      universalIdentifier: LAST_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'lastEvent',
      label: 'Last event',
      description: 'Most recent delivery status',
      icon: 'IconStatusChange',
      options: [
        {
          id: '1b69e2c9-81f0-4f14-8361-dda018c1c343',
          value: 'SENT',
          label: 'Sent',
          position: 0,
          color: 'blue',
        },
        {
          id: '9964e796-5b4a-4631-a0bd-7ab1848ae207',
          value: 'DELIVERED',
          label: 'Delivered',
          position: 1,
          color: 'green',
        },
        {
          id: 'e4ae61fe-2ea8-4ee3-8bb5-0c8f5c6e8081',
          value: 'DELIVERY_DELAYED',
          label: 'Delivery Delayed',
          position: 2,
          color: 'yellow',
        },
        {
          id: 'ea6d5170-c522-4559-a51e-f3f81435c632',
          value: 'COMPLAINED',
          label: 'Complained',
          position: 3,
          color: 'orange',
        },
        {
          id: 'eeafaa07-3b8a-4b89-b1d6-f4b113b0276f',
          value: 'BOUNCED',
          label: 'Bounced',
          position: 4,
          color: 'red',
        },
        {
          id: 'fa6b6add-7b95-4bb5-8f5f-a532430ac201',
          value: 'OPENED',
          label: 'Opened',
          position: 5,
          color: 'turquoise',
        },
        {
          id: 'c4529bad-d911-4f1f-aac3-620852a09eae',
          value: 'CLICKED',
          label: 'Clicked',
          position: 6,
          color: 'sky',
        },
      ],
    },
    {
      universalIdentifier: EMAIL_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'resendId',
      label: 'Resend ID',
      description: 'Resend email identifier',
      icon: 'IconHash',
    },
    {
      universalIdentifier: EMAIL_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'createdAt',
      label: 'Created at',
      description: 'When the email was created',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'scheduledAt',
      label: 'Scheduled at',
      description: 'When the email is scheduled to be sent',
      icon: 'IconCalendarEvent',
    },
    {
      universalIdentifier: TAGS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RAW_JSON,
      name: 'tags',
      label: 'Tags',
      description: 'Custom tags attached to the email',
      icon: 'IconTag',
    },
  ],
});
