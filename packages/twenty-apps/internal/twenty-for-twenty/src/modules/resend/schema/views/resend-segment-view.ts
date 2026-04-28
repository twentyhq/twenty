import {
  RESEND_BROADCASTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_CONTACTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_VIEW_BROADCASTS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_VIEW_CONTACTS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_SEGMENT_VIEW_UNIVERSAL_IDENTIFIER,
  SEGMENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineView } from 'twenty-sdk/define';

export default defineView({
  universalIdentifier: RESEND_SEGMENT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend segments',
  objectUniversalIdentifier: RESEND_SEGMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconUsersGroup',
  position: 0,
  fields: [
    {
      universalIdentifier: RESEND_SEGMENT_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        SEGMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier:
        RESEND_SEGMENT_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        SEGMENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier:
        RESEND_SEGMENT_VIEW_CONTACTS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        RESEND_CONTACTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier:
        RESEND_SEGMENT_VIEW_BROADCASTS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        RESEND_BROADCASTS_ON_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
  ],
});
