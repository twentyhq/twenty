import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'd1dd2153-4a6a-4234-a467-c4a688209823',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RAW_JSON,
  name: 'companyenrichData',
  label: 'Full CompanyEnrich profile',
  description:
    'Data from the most recent successful CompanyEnrich enrichment. Existing CRM fields are preserved.',
  icon: 'IconBraces',
  isNullable: true,
});
