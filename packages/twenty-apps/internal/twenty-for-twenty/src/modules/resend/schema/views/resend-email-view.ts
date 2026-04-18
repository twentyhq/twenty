import {
  BROADCAST_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  EMAIL_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  LAST_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_LAST_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_VIEW_UNIVERSAL_IDENTIFIER,
  SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineView } from 'twenty-sdk/define';

export default defineView({
  universalIdentifier: RESEND_EMAIL_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend emails',
  objectUniversalIdentifier: RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconMail',
  position: 0,
  fields: [
    {
      universalIdentifier:
        RESEND_EMAIL_VIEW_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier:
        RESEND_EMAIL_VIEW_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier:
        RESEND_EMAIL_VIEW_LAST_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        LAST_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier:
        RESEND_EMAIL_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        EMAIL_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier:
        RESEND_EMAIL_VIEW_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        PERSON_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier:
        RESEND_EMAIL_VIEW_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        CONTACT_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier:
        RESEND_EMAIL_VIEW_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        BROADCAST_ON_RESEND_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 6,
    },
  ],
});
