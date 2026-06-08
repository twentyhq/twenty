import { defineCommandMenuItem, objectMetadataItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: '719cfe1c-d570-4c8c-89e6-88671c6ba1ea',
  frontComponentUniversalIdentifier: '7c397b0c-8b19-4fac-924a-8f6aa1dece78',
  label: 'Fetch Project Items',
  icon: 'IconLayoutKanban',
  isPinned: false,
  conditionalAvailabilityExpression:
    objectMetadataItem.nameSingular === 'projectItem',
});
