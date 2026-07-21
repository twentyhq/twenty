import { defineView, ViewKey } from 'twenty-sdk/define';

import {
  DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_TARGET_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATES_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATES_VIEW_TARGET_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: TEMPLATES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All templates',
  objectUniversalIdentifier: DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconFileText',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: TEMPLATES_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: TEMPLATES_VIEW_TARGET_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        TEMPLATE_TARGET_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
  ],
});
