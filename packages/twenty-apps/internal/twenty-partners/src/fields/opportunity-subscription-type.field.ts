import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'a58214e9-38f9-4faf-8927-09b3980fd8c3',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'subscriptionType',
  label: 'Subscription Type',
  isNullable: true,
  options: [
    { id: '6d91b477-5bf1-4f5c-8aef-577b6c21fe45', value: 'PRO', label: 'Pro', position: 0, color: 'blue' },
    { id: '7b64f281-3445-4429-a5f0-af9484dff8b4', value: 'ORG', label: 'Org', position: 1, color: 'green' },
    { id: 'bf202f8f-caf9-45bf-a80c-65b344b2798d', value: 'ENT', label: 'Enterprise', position: 2, color: 'purple' },
  ],
});
