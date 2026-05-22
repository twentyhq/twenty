import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '59d5de53-202f-4913-a417-8a08970d87cc',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'subscriptionFrequency',
  label: 'Subscription Frequency',
  isNullable: true,
  options: [
    { id: 'e53a9ebb-11d6-40de-93f2-6bcb6ab7141c', value: 'MONTHLY', label: 'Monthly', position: 0, color: 'blue' },
    { id: '6eca9f01-f891-4c9d-bef6-9238c8e67392', value: 'ANNUAL', label: 'Annual', position: 1, color: 'green' },
  ],
});
