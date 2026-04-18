import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'bec14de7-6683-4784-91ba-62d83b5f30f7',
  name: 'lastInteraction',
  label: 'Last interaction',
  type: FieldType.DATE_TIME,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  description: 'Date when the last interaction happened',
});
