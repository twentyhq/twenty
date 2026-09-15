import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_BODY_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_TARGET_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_TARGET_OPTION_COMPANY_UNIVERSAL_IDENTIFIER,
  TEMPLATE_TARGET_OPTION_PERSON_UNIVERSAL_IDENTIFIER,
  TEMPLATE_TARGET_COMPANY,
  TEMPLATE_TARGET_PERSON,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: DOCUMENT_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'documentTemplate',
  namePlural: 'documentTemplates',
  labelSingular: 'Document template',
  labelPlural: 'Document templates',
  description:
    'A reusable document with placeholders like {{name.firstName}} that get filled from a CRM record.',
  icon: 'IconFileText',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Template name, e.g. "Sales proposal".',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: TEMPLATE_BODY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RICH_TEXT,
      name: 'body',
      label: 'Body',
      description:
        'Template edited with the rich-text editor. Type {{placeholders}} such as {{name.firstName}} or {{jobTitle}}; they are replaced with values from the selected record when a document is generated.',
      icon: 'IconFileText',
    },
    {
      universalIdentifier: TEMPLATE_TARGET_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'target',
      label: 'Target',
      description: 'Which kind of CRM record this template is written for.',
      icon: 'IconTarget',
      defaultValue: `'${TEMPLATE_TARGET_PERSON}'`,
      options: [
        {
          id: TEMPLATE_TARGET_OPTION_PERSON_UNIVERSAL_IDENTIFIER,
          value: TEMPLATE_TARGET_PERSON,
          label: 'Person',
          color: 'blue',
          position: 0,
        },
        {
          id: TEMPLATE_TARGET_OPTION_COMPANY_UNIVERSAL_IDENTIFIER,
          value: TEMPLATE_TARGET_COMPANY,
          label: 'Company',
          color: 'green',
          position: 1,
        },
      ],
    },
  ],
});
