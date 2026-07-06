import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The "one" side: a template lists every document generated from it.
export default defineField({
  universalIdentifier: TEMPLATE_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'documents',
  label: 'Documents',
  description: 'Documents generated from this template.',
  icon: 'IconFile',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DOCUMENT_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
