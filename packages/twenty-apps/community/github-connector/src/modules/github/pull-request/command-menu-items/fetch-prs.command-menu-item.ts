import { defineCommandMenuItem, objectMetadataItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: '0b24e6d6-da0c-4c0e-8d88-5bfd7f3cd75a',
  frontComponentUniversalIdentifier: '5e2ba8df-1db5-4964-94d3-44cccfd791a0',
  label: 'Fetch Pull Requests',
  icon: 'IconGitPullRequest',
  isPinned: false,
  conditionalAvailabilityExpression:
    objectMetadataItem.nameSingular === 'pullRequest',
});
