import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export default defineField({
  universalIdentifier: '9378751e-c23b-4e84-887d-2905cb8359b4',
  name: 'interactionStatus',
  label: 'Interaction status',
  type: FieldType.SELECT,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  description: 'Indicates the health of relation',
  options: [
    {
      id: '39d54a6b-5a0e-4209-9a59-2a2d7b8c462b',
      color: 'green',
      label: 'Recent',
      value: 'RECENT',
      position: 1,
    },
    {
      id: '7377d6c5-a75c-453e-a1a1-63fb9cba4e26',
      color: 'yellow',
      label: 'Active',
      value: 'ACTIVE',
      position: 2,
    },
    {
      id: 'a8b99246-237f-4715-b21f-94a3ae14994e',
      color: 'sky',
      label: 'Cooling',
      value: 'COOLING',
      position: 3,
    },
    {
      id: '1f05d528-eaab-4639-aba1-328050a87220',
      color: 'gray',
      label: 'Dormant',
      value: 'DORMANT',
      position: 4,
    },
  ],
});
