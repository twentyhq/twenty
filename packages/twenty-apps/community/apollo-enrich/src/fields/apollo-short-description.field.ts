import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export default defineField({
  universalIdentifier: 'be15e062-b065-48b4-979c-65b9a50e0cb1',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.TEXT,
  name: 'apolloShortDescription',
  label: 'Apollo Description',
  description: 'Short company description from Apollo enrichment',
  icon: 'IconFileDescription',
});
