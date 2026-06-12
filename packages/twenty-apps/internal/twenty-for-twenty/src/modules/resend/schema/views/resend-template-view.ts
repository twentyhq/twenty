import {
  RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_VIEW_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_VIEW_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_VIEW_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_VIEW_UNIVERSAL_IDENTIFIER,
  RESEND_TEMPLATE_VIEW_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from '@modules/resend/constants/universal-identifiers';
import { defineView } from 'twenty-sdk/define';

export default defineView({
  universalIdentifier: RESEND_TEMPLATE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend templates',
  objectUniversalIdentifier: RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconTemplate',
  position: 0,
  fields: [
    {
      universalIdentifier: RESEND_TEMPLATE_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_VIEW_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TEMPLATE_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_VIEW_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TEMPLATE_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_VIEW_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TEMPLATE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_VIEW_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TEMPLATE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier:
        RESEND_TEMPLATE_VIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TEMPLATE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
  ],
});
