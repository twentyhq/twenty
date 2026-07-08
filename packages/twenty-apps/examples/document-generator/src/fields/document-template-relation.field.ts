import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import {
  DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The "many" side: each document points to the template it was generated from.
export default defineField({
  universalIdentifier: DOCUMENT_TEMPLATE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'template',
  label: 'Template',
  description: 'The template this document was generated from.',
  icon: 'IconFileText',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    TEMPLATE_DOCUMENTS_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'templateId',
  },
});
