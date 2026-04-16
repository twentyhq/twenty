import { PERSON_ON_RESEND_CONTACT_ID } from 'src/fields/person-on-resend-contact.field';
import { RESEND_EMAILS_ON_CONTACT_ID } from 'src/fields/resend-emails-on-contact.field';
import { SEGMENT_ON_RESEND_CONTACT_ID } from 'src/fields/segment-on-resend-contact.field';
import {
  CONTACT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  CONTACT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/resend-contact';
import { defineView } from 'twenty-sdk';

export const RESEND_CONTACT_VIEW_UNIVERSAL_IDENTIFIER =
  '3d710924-5f47-4ac7-ba5e-28d3be9ee004';

export default defineView({
  universalIdentifier: RESEND_CONTACT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend contacts',
  objectUniversalIdentifier: RESEND_CONTACT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconAddressBook',
  position: 0,
  fields: [
    {
      universalIdentifier: 'f589ef0c-0f8b-4895-8d84-bd3b743f925f',
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: '3af5988f-de6b-46de-996b-439bd5acd51c',
      fieldMetadataUniversalIdentifier:
        CONTACT_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: 'efa38cf1-afcf-461a-9780-6d916e02256b',
      fieldMetadataUniversalIdentifier:
        UNSUBSCRIBED_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: 'a48545bb-8cf1-4836-82fa-d0c7bc314a1b',
      fieldMetadataUniversalIdentifier:
        CONTACT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: '9fc1ab4b-fc2d-4c33-9de5-3cff7b0ea5ec',
      fieldMetadataUniversalIdentifier: PERSON_ON_RESEND_CONTACT_ID,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: '54949f7e-0454-45a5-9e30-8f16f75adeaa',
      fieldMetadataUniversalIdentifier: SEGMENT_ON_RESEND_CONTACT_ID,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier: 'fbbe207d-dbda-4bda-935c-a6fa9ae30645',
      fieldMetadataUniversalIdentifier: RESEND_EMAILS_ON_CONTACT_ID,
      isVisible: true,
      size: 12,
      position: 6,
    },
  ],
});
