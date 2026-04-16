import { defineObject, FieldType } from 'twenty-sdk';

export const RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER =
  'cb91a26f-131b-4db4-916b-7a308fcc29d7';

export const CONTACT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER =
  '62ce21e5-a015-4f26-8c7a-3c141b6d7064';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'e0fb9280-4588-4c2b-8996-bbd4c1d33f54';

export const UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER =
  '41403b6f-b91e-4eb6-8875-8b5c21b0a6d3';

export const CONTACT_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'c84c8703-33e1-4acb-8a7f-1d62647166d5';

export const CONTACT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '040bf210-36cf-49cb-8d83-0da9b864c900';

export default defineObject({
  universalIdentifier: RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'resendContact',
  namePlural: 'resendContacts',
  labelSingular: 'Resend contact',
  labelPlural: 'Resend contacts',
  description: 'A contact from Resend',
  icon: 'IconAddressBook',
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: CONTACT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.EMAILS,
      name: 'email',
      label: 'Email',
      description: 'Contact email address',
      icon: 'IconMail',
    },
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FULL_NAME,
      name: 'name',
      label: 'Name',
      description: 'Name of the contact',
      icon: 'IconUser',
    },
    {
      universalIdentifier: UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'unsubscribed',
      label: 'Unsubscribed',
      description: 'Whether the contact has unsubscribed',
      icon: 'IconMailOff',
    },
    {
      universalIdentifier: CONTACT_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'resendId',
      label: 'Resend ID',
      description: 'Resend contact identifier',
      icon: 'IconHash',
    },
    {
      universalIdentifier: CONTACT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'createdAt',
      label: 'Created at',
      description: 'When the contact was created',
      icon: 'IconCalendar',
    },
  ],
});
