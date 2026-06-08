import { defineCommandMenuItem, objectMetadataItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: '4640992f-c2c9-4bba-b5df-9c8f05dc9e80',
  frontComponentUniversalIdentifier: '08f40f82-24ed-4f3e-8c99-695151e90e38',
  label: 'Fetch Contributors',
  icon: 'IconUsers',
  isPinned: false,
  conditionalAvailabilityExpression:
    objectMetadataItem.nameSingular === 'contributor',
});
