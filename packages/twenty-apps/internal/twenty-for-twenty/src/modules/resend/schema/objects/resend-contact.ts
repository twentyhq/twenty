import {
  CONTACT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_LAST_SYNCED_FROM_RESEND_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_RESEND_ID_FIELD_UNIVERSAL_IDENTIFIER,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineObject, FieldType } from 'twenty-sdk/define';

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
    {
      universalIdentifier:
        CONTACT_LAST_SYNCED_FROM_RESEND_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'lastSyncedFromResend',
      label: 'Last synced from Resend',
      description: 'Timestamp of last inbound sync (used to prevent echo loops)',
      icon: 'IconClock',
    },
  ],
});
