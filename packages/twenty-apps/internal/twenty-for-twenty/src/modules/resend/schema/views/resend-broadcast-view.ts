import {
  BROADCAST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  BROADCAST_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_EMAILS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_BROADCAST_VIEW_UNIVERSAL_IDENTIFIER,
  RESEND_EMAILS_ON_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
  SEGMENT_ON_RESEND_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/constants/universal-identifiers';
import { defineView } from 'twenty-sdk/define';

export default defineView({
  universalIdentifier: RESEND_BROADCAST_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend broadcasts',
  objectUniversalIdentifier: RESEND_BROADCAST_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconSpeakerphone',
  position: 0,
  fields: [
    {
      universalIdentifier: RESEND_BROADCAST_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        BROADCAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier:
        RESEND_BROADCAST_VIEW_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        BROADCAST_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier:
        RESEND_BROADCAST_VIEW_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        BROADCAST_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier:
        RESEND_BROADCAST_VIEW_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        BROADCAST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier:
        RESEND_BROADCAST_VIEW_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        BROADCAST_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier:
        RESEND_BROADCAST_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        BROADCAST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier:
        RESEND_BROADCAST_VIEW_SEGMENT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        SEGMENT_ON_RESEND_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 6,
    },
    {
      universalIdentifier:
        RESEND_BROADCAST_VIEW_EMAILS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        RESEND_EMAILS_ON_BROADCAST_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 7,
    },
  ],
});
