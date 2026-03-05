import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export default defineField({
  universalIdentifier: 'c90ae72d-4ddf-4f22-882f-eef98c91e40e',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'apolloTotalFunding',
  label: 'Total Funding',
  description: 'Total funding raised by the company, from Apollo enrichment',
  icon: 'IconCash',
});
