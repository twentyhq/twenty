import { defineObject, FieldType } from 'twenty-sdk';

export const RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER =
  '85ddb31f-0d1c-4619-bbaf-3d208c1b9fea';

export const TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'a045319f-483d-4625-86cd-653111dc8ac3';

export const TEMPLATE_ALIAS_FIELD_UNIVERSAL_IDENTIFIER =
  '850a9d4a-df38-4af0-ba69-aaef090cafef';

export const TEMPLATE_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'f98b84c0-c8ef-4f9e-a72a-a53e2ef60fea';

export const TEMPLATE_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER =
  '33a80d6c-e6ee-490e-b5ac-87b557bcdf50';

export const TEMPLATE_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER =
  '3aff5a64-49fa-450c-b85d-4d4f210f6433';

export const TEMPLATE_REPLY_TO_FIELD_UNIVERSAL_IDENTIFIER =
  'b05c1a87-4cea-4e01-8e6a-eff5929de149';

export const TEMPLATE_HTML_FIELD_UNIVERSAL_IDENTIFIER =
  '9ced95c8-345d-438d-97dc-f52b99f4a9c3';

export const TEMPLATE_TEXT_FIELD_UNIVERSAL_IDENTIFIER =
  'd7614d4c-ed00-4961-8765-7c8b0c9a320b';

export const TEMPLATE_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '3883be35-ab0e-4bed-bc59-131683b9a0b2';

export const TEMPLATE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '72939761-7a57-4448-997a-68da6b4f60db';

export const TEMPLATE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'cfe6a645-ee89-4117-8ace-fb9623e726cc';

export const TEMPLATE_PUBLISHED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '669a3ebb-d60b-41a3-81e9-53ab8b18f2b1';

export default defineObject({
  universalIdentifier: RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'resendTemplate',
  namePlural: 'resendTemplates',
  labelSingular: 'Resend template',
  labelPlural: 'Resend templates',
  description: 'An email template from Resend',
  icon: 'IconTemplate',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the template',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: TEMPLATE_ALIAS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'alias',
      label: 'Alias',
      description: 'Alternative identifier for the template',
      icon: 'IconTag',
    },
    {
      universalIdentifier: TEMPLATE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Publication status of the template',
      icon: 'IconStatusChange',
      options: [
        {
          id: '3047dfdd-5424-44bc-bead-f2e2a84f363f',
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: '146cf14d-e276-4477-86f5-4114de97bccb',
          value: 'PUBLISHED',
          label: 'Published',
          position: 1,
          color: 'green',
        },
      ],
    },
    {
      universalIdentifier: TEMPLATE_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'fromAddress',
      label: 'From',
      description: 'Sender email address',
      icon: 'IconMailForward',
    },
    {
      universalIdentifier: TEMPLATE_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'subject',
      label: 'Subject',
      description: 'Email subject line',
      icon: 'IconMail',
    },
    {
      universalIdentifier: TEMPLATE_REPLY_TO_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'replyTo',
      label: 'Reply to',
      description: 'Reply-to email address',
      icon: 'IconMailReply',
    },
    {
      universalIdentifier: TEMPLATE_HTML_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'htmlBody',
      label: 'HTML body',
      description: 'HTML content of the template',
      icon: 'IconFileText',
    },
    {
      universalIdentifier: TEMPLATE_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'textBody',
      label: 'Text body',
      description: 'Plain text content of the template',
      icon: 'IconAlignLeft',
    },
    {
      universalIdentifier: TEMPLATE_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'resendId',
      label: 'Resend ID',
      description: 'Resend template identifier',
      icon: 'IconHash',
    },
    {
      universalIdentifier: TEMPLATE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'createdAt',
      label: 'Created at',
      description: 'When the template was created',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: TEMPLATE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'resendUpdatedAt',
      label: 'Resend updated at',
      description: 'When the template was last updated in Resend',
      icon: 'IconCalendarClock',
    },
    {
      universalIdentifier: TEMPLATE_PUBLISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'publishedAt',
      label: 'Published at',
      description: 'When the template was published',
      icon: 'IconCalendarEvent',
    },
  ],
});
