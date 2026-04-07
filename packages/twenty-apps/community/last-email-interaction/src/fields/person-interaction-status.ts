import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export default defineField({
  universalIdentifier: 'fa342e26-9742-4db8-85b4-4d78ba18482f',
  name: 'interactionStatus',
  label: 'Interaction status',
  type: FieldType.SELECT,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  description: 'Indicates the health of relation',
  options: [
    {
      id: '1dfbfa99-35fb-43af-8c14-74e682a8121b',
      color: 'green',
      label: 'Recent',
      value: 'RECENT',
      position: 1,
    },
    {
      id: '955788e8-6d64-45ba-80ea-a1a5446a0ae7',
      color: 'yellow',
      label: 'Active',
      value: 'ACTIVE',
      position: 2,
    },
    {
      id: '7b84ca72-fac5-4c6d-ab08-b148e4b3efdf',
      color: 'sky',
      label: 'Cooling',
      value: 'COOLING',
      position: 3,
    },
    {
      id: '04dea3e5-ec26-41cf-b23f-37abab67827a',
      color: 'gray',
      label: 'Dormant',
      value: 'DORMANT',
      position: 4,
    },
  ],
});
