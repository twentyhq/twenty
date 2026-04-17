import { RESEND_BROADCASTS_ON_SEGMENT_ID } from 'src/modules/resend/fields/resend-broadcasts-on-segment.field';
import { RESEND_CONTACTS_ON_SEGMENT_ID } from 'src/modules/resend/fields/resend-contacts-on-segment.field';
import {
  RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  SEGMENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/objects/resend-segment';
import { defineView } from 'twenty-sdk';

export const RESEND_SEGMENT_VIEW_UNIVERSAL_IDENTIFIER =
  '30683084-d0d4-4d25-bb5f-c6bcff9fc92a';

export default defineView({
  universalIdentifier: RESEND_SEGMENT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend segments',
  objectUniversalIdentifier: RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconUsersGroup',
  position: 0,
  fields: [
    {
      universalIdentifier: 'dc878169-b670-4aff-90b4-869849ec063e',
      fieldMetadataUniversalIdentifier:
        SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: '4898ae92-b94e-4bbf-850d-76011613fd64',
      fieldMetadataUniversalIdentifier:
        SEGMENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: 'cd223c54-d968-4830-b84f-ebefe8595842',
      fieldMetadataUniversalIdentifier: RESEND_CONTACTS_ON_SEGMENT_ID,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: '0adacbc6-f355-49bb-9350-b7202cf28b8c',
      fieldMetadataUniversalIdentifier: RESEND_BROADCASTS_ON_SEGMENT_ID,
      isVisible: true,
      size: 12,
      position: 3,
    },
  ],
});
