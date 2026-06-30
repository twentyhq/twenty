import {
  RESEND_BROADCASTS_ON_TOPIC_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_VIEW_BROADCASTS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_VIEW_DEFAULT_SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_VIEW_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_VIEW_UNIVERSAL_IDENTIFIER,
  RESEND_TOPIC_VIEW_VISIBILITY_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_DEFAULT_SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TOPIC_VISIBILITY_FIELD_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineView } from 'twenty-sdk/define';

export default defineView({
  universalIdentifier: RESEND_TOPIC_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend topics',
  objectUniversalIdentifier: RESEND_TOPIC_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconHash',
  position: 0,
  fields: [
    {
      universalIdentifier: RESEND_TOPIC_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: TOPIC_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier:
        RESEND_TOPIC_VIEW_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TOPIC_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier:
        RESEND_TOPIC_VIEW_VISIBILITY_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TOPIC_VISIBILITY_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier:
        RESEND_TOPIC_VIEW_DEFAULT_SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TOPIC_DEFAULT_SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier:
        RESEND_TOPIC_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TOPIC_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier:
        RESEND_TOPIC_VIEW_BROADCASTS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        RESEND_BROADCASTS_ON_TOPIC_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
  ],
});
