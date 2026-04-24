import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '2f195c4c-1db1-4bbe-80b6-25c2f63168b0',
  name: 'lastInteraction',
  label: 'Last interaction',
  type: FieldType.DATE_TIME,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  description: 'Date when the last interaction happened',
});
