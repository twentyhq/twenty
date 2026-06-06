import { defineCommandMenuItem, objectMetadataItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: '7d3f2b9e-5c0a-4e8b-ad6e-2f9c3b4d5e6a',
  frontComponentUniversalIdentifier: '6c2f1a8d-4b9e-4f7a-9c5d-1e8b2a3d4c5f',
  label: 'Contributor Stats',
  icon: 'IconChartBar',
  isPinned: false,
  conditionalAvailabilityExpression:
    objectMetadataItem.nameSingular === 'contributor',
});
