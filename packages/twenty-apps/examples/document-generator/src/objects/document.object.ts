import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  DOCUMENT_CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_STATUS_DRAFT,
  DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  DOCUMENT_STATUS_GENERATED,
  DOCUMENT_STATUS_OPTION_DRAFT_UNIVERSAL_IDENTIFIER,
  DOCUMENT_STATUS_OPTION_GENERATED_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: DOCUMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'document',
  namePlural: 'documents',
  labelSingular: 'Document',
  labelPlural: 'Documents',
  description: 'A generated document produced from a template and a CRM record.',
  icon: 'IconFile',
  labelIdentifierFieldMetadataUniversalIdentifier:
    DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: DOCUMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Document name.',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: DOCUMENT_CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'content',
      label: 'Content',
      description: 'The rendered document text, with all placeholders filled.',
      icon: 'IconFileText',
    },
    {
      universalIdentifier: DOCUMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Where this document is in its lifecycle.',
      icon: 'IconProgress',
      defaultValue: `'${DOCUMENT_STATUS_DRAFT}'`,
      options: [
        {
          id: DOCUMENT_STATUS_OPTION_DRAFT_UNIVERSAL_IDENTIFIER,
          value: DOCUMENT_STATUS_DRAFT,
          label: 'Draft',
          color: 'gray',
          position: 0,
        },
        {
          id: DOCUMENT_STATUS_OPTION_GENERATED_UNIVERSAL_IDENTIFIER,
          value: DOCUMENT_STATUS_GENERATED,
          label: 'Generated',
          color: 'green',
          position: 1,
        },
      ],
    },
    {
      universalIdentifier: DOCUMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FILES,
      name: 'file',
      label: 'File',
      description: 'The generated document as a downloadable PDF.',
      icon: 'IconFileTypePdf',
      universalSettings: { maxNumberOfValues: 1 },
    },
  ],
});
