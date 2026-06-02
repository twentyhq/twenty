import { defineCommandMenuItem, objectMetadataItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'c34f56aa-ff65-43a4-9db2-774945dbcc53',
  frontComponentUniversalIdentifier: '9430e4fc-9ecb-428d-9bde-2babeb1f452f',
  label: 'Fetch Issues',
  icon: 'IconBug',
  isPinned: false,
  conditionalAvailabilityExpression:
    objectMetadataItem.nameSingular === 'issue',
});
