import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'f83c3f9f-2eac-4aa6-92de-27d4afcaa2af',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.TEXT,
  name: 'companyenrichEmployeeRange',
  label: 'CompanyEnrich employee range',
  description:
    'Data from the most recent successful CompanyEnrich enrichment. Existing CRM fields are preserved.',
  icon: 'IconText',
  isNullable: true,
});
