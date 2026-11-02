import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '74256953-9557-4a1f-ba43-25bade67a881',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'companyenrichDepartment',
  label: 'CompanyEnrich department',
  description:
    'Data from the most recent successful CompanyEnrich enrichment. Existing CRM fields are preserved.',
  icon: 'IconText',
  isNullable: true,
});
