import { defineView, ViewType } from 'twenty-sdk/define';

import {
  WHATSAPP_TEMPLATE_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_PARAMETER_FORMAT_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_QUALITY_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_REJECTED_REASON_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATES_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
  WHATSAPP_TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: WHATSAPP_TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All WhatsApp templates',
  objectUniversalIdentifier: WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
  icon: 'IconTemplate',
  type: ViewType.TABLE,
  position: 0,
  fields: [
    {
      universalIdentifier: WHATSAPP_TEMPLATES_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.name,
      fieldMetadataUniversalIdentifier: WHATSAPP_TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: WHATSAPP_TEMPLATES_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.status,
      fieldMetadataUniversalIdentifier: WHATSAPP_TEMPLATE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: WHATSAPP_TEMPLATES_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.category,
      fieldMetadataUniversalIdentifier: WHATSAPP_TEMPLATE_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: WHATSAPP_TEMPLATES_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.language,
      fieldMetadataUniversalIdentifier: WHATSAPP_TEMPLATE_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: WHATSAPP_TEMPLATES_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.quality,
      fieldMetadataUniversalIdentifier: WHATSAPP_TEMPLATE_QUALITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: WHATSAPP_TEMPLATES_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.parameterFormat,
      fieldMetadataUniversalIdentifier: WHATSAPP_TEMPLATE_PARAMETER_FORMAT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: WHATSAPP_TEMPLATES_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.rejectedReason,
      fieldMetadataUniversalIdentifier: WHATSAPP_TEMPLATE_REJECTED_REASON_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 200,
    },
  ],
});
