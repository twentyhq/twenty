import { BROADCAST_ON_RESEND_EMAIL_ID } from 'src/modules/resend/fields/broadcast-on-resend-email.field';
import { CONTACT_ON_RESEND_EMAIL_ID } from 'src/modules/resend/fields/contact-on-resend-email.field';
import { PERSON_ON_RESEND_EMAIL_ID } from 'src/modules/resend/fields/person-on-resend-email.field';
import {
  EMAIL_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  LAST_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/objects/resend-email';
import { defineView } from 'twenty-sdk';

export const RESEND_EMAIL_VIEW_UNIVERSAL_IDENTIFIER =
  '43571c5b-f71d-47bf-95b3-8741b2201315';

export default defineView({
  universalIdentifier: RESEND_EMAIL_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend emails',
  objectUniversalIdentifier: RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconMail',
  position: 0,
  fields: [
    {
      universalIdentifier: '3a3ee801-6dfa-43b4-ba22-5c079a2d238d',
      fieldMetadataUniversalIdentifier: SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: '486e23dd-3d8b-42d8-86a8-146d5fd7aaf0',
      fieldMetadataUniversalIdentifier:
        FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: '94e9b3ce-c858-4b15-96ca-69fedf834853',
      fieldMetadataUniversalIdentifier:
        LAST_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: '61dd7f9f-ce22-4fb4-aeee-f36154211cf8',
      fieldMetadataUniversalIdentifier:
        EMAIL_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: '5b6cf4a7-f11f-49d4-bc05-8f1d6e0ad72a',
      fieldMetadataUniversalIdentifier: PERSON_ON_RESEND_EMAIL_ID,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: 'abee6dcd-4754-45b2-ae77-d42bec85afad',
      fieldMetadataUniversalIdentifier: CONTACT_ON_RESEND_EMAIL_ID,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier: '8d7df695-5ffb-46b7-9a57-ac979988351f',
      fieldMetadataUniversalIdentifier: BROADCAST_ON_RESEND_EMAIL_ID,
      isVisible: true,
      size: 12,
      position: 6,
    },
  ],
});
