import { defineView, ViewKey } from 'twenty-sdk/define';

import {
  DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENTS_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENTS_VIEW_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENTS_VIEW_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All documents',
  objectUniversalIdentifier: DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconFile',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: DOCUMENTS_VIEW_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: DOCUMENTS_VIEW_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: DOCUMENTS_VIEW_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier:
        DOCUMENT_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 200,
    },
  ],
});
