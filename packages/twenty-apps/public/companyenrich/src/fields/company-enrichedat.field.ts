import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'c7c15dfd-b380-4625-8f93-e78b4ae7f6ea',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'companyenrichEnrichedAt',
  label: 'CompanyEnrich enriched at',
  description:
    'Data from the most recent successful CompanyEnrich enrichment. Existing CRM fields are preserved.',
  icon: 'IconClock',
  isNullable: true,
});
