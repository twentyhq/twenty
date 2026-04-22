import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'da15cfc6-3657-457d-8757-4ba11b5bb6e1',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'apolloFoundedYear',
  label: 'Founded Year',
  description: 'Year the company was founded, from Apollo enrichment',
  icon: 'IconCalendar',
});
