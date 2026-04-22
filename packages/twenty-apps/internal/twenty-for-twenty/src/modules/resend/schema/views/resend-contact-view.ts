import {
  CONTACT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_EMAILS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_VIEW_UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAILS_ON_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
  UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineView } from 'twenty-sdk/define';

export default defineView({
  universalIdentifier: RESEND_CONTACT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend contacts',
  objectUniversalIdentifier: RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconAddressBook',
  position: 0,
  fields: [
    {
      universalIdentifier: RESEND_CONTACT_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: RESEND_CONTACT_VIEW_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        CONTACT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier:
        RESEND_CONTACT_VIEW_UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier:
        RESEND_CONTACT_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        CONTACT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier:
        RESEND_CONTACT_VIEW_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        PERSON_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier:
        RESEND_CONTACT_VIEW_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        SEGMENT_ON_RESEND_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier:
        RESEND_CONTACT_VIEW_EMAILS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        RESEND_EMAILS_ON_CONTACT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 6,
    },
  ],
});
