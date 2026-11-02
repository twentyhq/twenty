import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '517098bb-f501-47c3-a648-2ce20981b6cd',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.TEXT,
  name: 'companyenrichIndustry',
  label: 'CompanyEnrich industry',
  description:
    'Data from the most recent successful CompanyEnrich enrichment. Existing CRM fields are preserved.',
  icon: 'IconText',
  isNullable: true,
});
